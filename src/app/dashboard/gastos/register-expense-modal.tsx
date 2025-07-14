
'use client';

import { useState, useRef, useEffect, useCallback, useTransition, useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, Loader2, ScanLine, Terminal, Upload, Camera, VideoOff } from 'lucide-react';
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from '@/hooks/use-toast';
import { type ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';
import { scanReceiptAction } from './actions';
import { AuthContext } from '@/context/auth-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface RegisterExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: (data: ExtractReceiptDataOutput) => void;
  initialData?: ExtractReceiptDataOutput;
}

export function RegisterExpenseModal({ isOpen, onClose, onOpenModal, initialData }: RegisterExpenseModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [view, setView] = useState<'form' | 'camera'>('form');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isSaving, startTransition] = useTransition();

  // Form state
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<string>('');
  const [proveedor, setProveedor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [importe, setImporte] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  
  const resetForm = useCallback(() => {
    setDate(new Date());
    setCategory('');
    setProveedor('');
    setDescripcion('');
    setImporte('');
    setMetodoPago('');
    setScanError(null);
  }, []);

  useEffect(() => {
    if (initialData) {
      const parsedDate = initialData.date ? parseISO(initialData.date) : new Date();
      setDate(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
      
      setCategory(initialData.category || '');
      setProveedor(initialData.supplier || '');
      setDescripcion(initialData.description || '');
      setImporte(initialData.totalAmount?.toString() || '');
    } else {
        resetForm();
    }
  }, [initialData, resetForm]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    setView('form');
    resetForm();
    onClose();
  }, [stopCamera, resetForm, onClose]);


  const handleRegister = () => {
    startTransition(async () => {
        if (!date || !category || !proveedor || !importe || !metodoPago) {
            toast({
                variant: 'destructive',
                title: 'Campos requeridos',
                description: 'Por favor, completa todos los campos obligatorios.',
            });
            return;
        }

        if (!user) {
            toast({
                variant: 'destructive',
                title: 'No estás autenticado',
                description: 'Por favor, inicia sesión para registrar un gasto.',
            });
            return;
        }

        const expenseData = {
            ownerId: user.uid,
            fecha: date,
            categoria: category,
            proveedor: proveedor,
            descripcion: descripcion,
            importe: parseFloat(importe),
            metodoPago: metodoPago,
            fechaCreacion: serverTimestamp(),
        };
        
        try {
            await addDoc(collection(db, "expenses"), expenseData);
            toast({
                title: 'Gasto Registrado',
                description: 'El nuevo gasto ha sido añadido a tu lista.',
            });
            handleClose();
        } catch (error) {
            console.error("Error al registrar gasto: ", error);
            toast({
                variant: 'destructive',
                title: 'Error al registrar el gasto',
                description: 'No se pudo guardar el gasto. Revisa las reglas de Firestore.',
            });
        }
    });
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const processReceiptDataUri = async (receiptDataUri: string) => {
    setIsScanning(true);
    setScanError(null);
    setView('form');

    const formData = new FormData();
    formData.append('receiptDataUri', receiptDataUri);

    const result = await scanReceiptAction(formData);

    setIsScanning(false);
    
    if (result.error) {
        setScanError(result.error);
    } else if (result.data) {
        toast({
          title: 'Datos extraídos con IA',
          description: 'Revisa y completa el formulario con los datos cargados.',
        })
        onOpenModal(result.data);
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      await processReceiptDataUri(reader.result as string);
    };
    event.target.value = ''; // Reset file input
  };

  const getCameraPermission = useCallback(async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        setHasCameraPermission(false);
      }
    }, []);

  useEffect(() => {
    if (isOpen && view === 'camera') {
        getCameraPermission();
    } else {
        stopCamera();
    }
    return () => {
        stopCamera();
    }
  }, [isOpen, view, getCameraPermission, stopCamera]);

  const handleCaptureAndScan = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const dataUri = canvas.toDataURL('image/jpeg');
          processReceiptDataUri(dataUri);
      }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{view === 'form' ? 'Registrar Nuevo Gasto' : 'Escanear con Cámara'}</DialogTitle>
           <DialogDescription>
            {view === 'form' 
              ? 'Completa la info o usa la IA para escanear un ticket.' 
              : 'Apunta al ticket y pulsa capturar.'}
          </DialogDescription>
        </DialogHeader>
        
        {view === 'form' && (
          <div className="space-y-4 py-4">
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={handleImportClick} disabled={isScanning || isSaving}>
                    {isScanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : <><Upload className="mr-2 h-4 w-4" /> Importar Ticket</>}
                </Button>
                 <Button variant="outline" className="w-full" onClick={() => setView('camera')} disabled={isScanning || isSaving}>
                    <Camera className="mr-2 h-4 w-4" /> Escanear con Cámara
                 </Button>
              </div>

              {isScanning && (
                <div className="text-center text-sm text-muted-foreground">La IA está analizando tu ticket...</div>
              )}
              
              {scanError && (
                  <Alert variant="destructive">
                      <Terminal className="h-4 w-4" />
                      <AlertTitle>Error de Escaneo</AlertTitle>
                      <AlertDescription>{scanError}</AlertDescription>
                  </Alert>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Fecha *</Label>
                   <Popover>
                      <PopoverTrigger asChild>
                          <Button variant={"outline"} className={cn("w-full col-span-3 justify-start text-left font-normal", !date && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP", {locale: es}) : <span>Elige una fecha</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                  </Popover>
              </div>
              
               <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Categoría *</Label>
                  <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Software">Software</SelectItem>
                          <SelectItem value="Oficina">Oficina</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Viajes">Viajes</SelectItem>
                          <SelectItem value="Suministros">Suministros</SelectItem>
                          <SelectItem value="Otros">Otros</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="proveedor" className="text-right">Proveedor *</Label>
                  <Input id="proveedor" placeholder="Ej: Amazon, Ferretería Paco" className="col-span-3" value={proveedor} onChange={(e) => setProveedor(e.target.value)} />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="descripcion" className="text-right pt-2">Descripción</Label>
                  <Textarea id="descripcion" placeholder="Detalles del gasto..." className="col-span-3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="importe" className="text-right">Importe (€) *</Label>
                  <Input id="importe" type="number" placeholder="Ej: 75.50" className="col-span-3" value={importe} onChange={(e) => setImporte(e.target.value)} />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="metodo-pago" className="text-right">Método Pago *</Label>
                   <Select value={metodoPago} onValueChange={setMetodoPago}>
                      <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Selecciona un método" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                          <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                          <SelectItem value="Efectivo">Efectivo</SelectItem>
                          <SelectItem value="Transferencia">Transferencia</SelectItem>
                          <SelectItem value="Paypal">Paypal</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          </div>
        )}

        {view === 'camera' && (
             <div className="space-y-4 py-4">
                <div className="relative aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                    <video ref={videoRef} className={cn("w-full h-full object-cover", hasCameraPermission === null || hasCameraPermission === false ? 'hidden' : 'block')} autoPlay muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                    {hasCameraPermission === false && (
                        <div className="absolute flex flex-col items-center text-muted-foreground p-4 text-center">
                            <VideoOff className="h-12 w-12" />
                            <p className="mt-2 text-sm">Cámara no disponible.</p>
                             <p className="text-xs mt-1">Asegúrate de haber concedido permisos en tu navegador.</p>
                        </div>
                    )}
                     {hasCameraPermission === null && (
                        <div className="absolute flex flex-col items-center text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="mt-2 text-sm">Accediendo a la cámara...</p>
                        </div>
                    )}
                </div>
                <Button className="w-full" disabled={!hasCameraPermission || isScanning} onClick={handleCaptureAndScan}>
                    {isScanning ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Escaneando...</>
                    ) : (
                        <><ScanLine className="mr-2 h-4 w-4" /> Capturar y escanear</>
                    )}
                </Button>
            </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => view === 'form' ? handleClose() : setView('form')} disabled={isSaving}>
            {view === 'form' ? 'Cancelar' : 'Volver'}
          </Button>
          {view === 'form' && (
            <Button onClick={handleRegister} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Guardando...' : 'Registrar Gasto'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
