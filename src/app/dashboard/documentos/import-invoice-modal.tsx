
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UploadCloud, Camera, VideoOff, Loader2, FileSpreadsheet, Sheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { scanInvoiceAction, processCsvInvoicesAction } from '@/lib/firebase/document-actions';
import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';


export function ImportInvoiceModal({
  isOpen,
  onClose,
  onDataExtracted,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (data: ExtractInvoiceDataOutput) => void;
}) {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('upload');
  const [singleFileName, setSingleFileName] = useState('');
  const [singleFileDataUri, setSingleFileDataUri] = useState<string | null>(null);
  const [multiFile, setMultiFile] = useState<File | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [isUploadingMulti, setIsUploadingMulti] = useState(false);

  const handleSingleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSingleFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSingleFileDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSingleFileName('');
      setSingleFileDataUri(null);
    }
  };
  
  const handleMultiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMultiFile(file);
    } else {
      setMultiFile(null);
    }
  }

  const handleSingleImport = async () => {
    if (!singleFileDataUri) return;
    setIsScanning(true);
    const result = await scanInvoiceAction(singleFileDataUri);
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error al Extraer Datos',
        description: result.error,
      });
    } else if (result.data) {
      toast({
        title: 'Datos Extraídos',
        description: 'La información de la factura se ha cargado en el formulario.',
      });
      onDataExtracted(result.data);
    }
    setIsScanning(false);
  };
  
   const handleMultiImport = async () => {
    if (!multiFile || !user) return;
    setIsUploadingMulti(true);
    
    const reader = new FileReader();
    reader.readAsText(multiFile);
    reader.onload = async (e) => {
        const csvContent = e.target?.result as string;
        if (!csvContent) {
            toast({ variant: 'destructive', title: 'Error de Lectura', description: 'No se pudo leer el contenido del archivo.' });
            setIsUploadingMulti(false);
            return;
        }

        const result = await processCsvInvoicesAction(csvContent);

        if (result.error) {
             toast({ variant: 'destructive', title: 'Error de Procesamiento', description: result.error });
             setIsUploadingMulti(false);
             return;
        }

        if (result.data && result.data.invoices.length > 0) {
            // Simulate background processing by just adding them.
            // In a real app, this would be a batch write and maybe a background job for large files.
            const promises = result.data.invoices.map(invoice => {
                const docData = {
                    ownerId: user.uid,
                    numero: invoice.numero,
                    tipo: 'factura' as const,
                    cliente: invoice.cliente,
                    fechaEmision: new Date(invoice.fechaEmision),
                    fechaVto: invoice.fechaVto ? new Date(invoice.fechaVto) : null,
                    lineas: [{ description: 'Importado desde CSV', quantity: 1, unitPrice: invoice.subtotal, total: invoice.subtotal }],
                    subtotal: invoice.subtotal,
                    impuestos: invoice.impuestos,
                    importe: invoice.total,
                    estado: invoice.estado as any,
                    moneda: invoice.moneda,
                    fechaCreacion: serverTimestamp(),
                };
                return addDoc(collection(db, 'invoices'), docData);
            });
            
            await Promise.all(promises);

            toast({
                title: 'Importación Completada',
                description: `${result.data.invoices.length} facturas han sido importadas con éxito.`,
            });
        } else {
             toast({ title: 'Importación Finalizada', description: 'No se encontraron facturas para importar en el archivo.' });
        }
        
        setIsUploadingMulti(false);
        onClose();
    };
  };


  const getCameraPermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'Cámara no soportada',
        description: 'Tu navegador no soporta el acceso a la cámara.',
      });
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Acceso a la cámara denegado',
        description: 'Por favor, activa los permisos de la cámara en tu navegador.',
      });
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      getCameraPermission();
    } else if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [isOpen, activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Documentos</DialogTitle>
          <DialogDescription>
            Usa la IA para importar facturas individuales o sube un archivo para una importación masiva.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
            <TabsTrigger value="camera">Capturar con Cámara</TabsTrigger>
            <TabsTrigger value="multi-upload">Importación Múltiple</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Seleccionar Factura (JPG, PNG, PDF)</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={handleSingleFileChange}
                accept="image/*,application/pdf"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
            <Button onClick={handleSingleImport} className="w-full" disabled={!singleFileName || isScanning}>
              {isScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              {isScanning ? 'Extrayendo...' : `Importar ${singleFileName}`}
            </Button>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>¿Cómo funciona?</AlertTitle>
              <AlertDescription>
                La IA procesará la imagen y rellenará el formulario de creación de documentos por ti.
              </AlertDescription>
            </Alert>
          </TabsContent>
          <TabsContent value="camera" className="pt-4 space-y-4">
            <div className="relative aspect-video bg-muted rounded-md flex items-center justify-center">
              <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
              {hasCameraPermission === false && (
                <div className="absolute flex flex-col items-center text-muted-foreground">
                  <VideoOff className="h-12 w-12" />
                  <p className="mt-2 text-sm">Cámara no disponible</p>
                </div>
              )}
            </div>
            <Button className="w-full" disabled={!hasCameraPermission || isScanning}>
              <Camera className="mr-2 h-4 w-4" />
              Capturar y Extraer
            </Button>
          </TabsContent>
           <TabsContent value="multi-upload" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="multi-file-upload">Seleccionar Archivo (CSV, XLS, XLSX)</Label>
              <Input
                id="multi-file-upload"
                type="file"
                onChange={handleMultiFileChange}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
            </div>
            <Button onClick={handleMultiImport} className="w-full" disabled={!multiFile || isUploadingMulti}>
              {isUploadingMulti ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
              {isUploadingMulti ? 'Procesando...' : `Iniciar Importación`}
            </Button>
             <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Importación Masiva</AlertTitle>
              <AlertDescription>
                Importa todas tus facturas de una vez desde otra aplicación. El proceso se ejecutará en segundo plano.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
