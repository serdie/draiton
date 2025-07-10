'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, Loader2, ScanLine, Terminal } from 'lucide-react';
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from '@/hooks/use-toast';
import { type ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';
import { scanReceiptAction } from './actions';

interface RegisterExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: (data: ExtractReceiptDataOutput) => void;
  initialData?: ExtractReceiptDataOutput;
}

export function RegisterExpenseModal({ isOpen, onClose, onOpenModal, initialData }: RegisterExpenseModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Form state
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState<string>('');
  const [proveedor, setProveedor] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [importe, setImporte] = useState('');
  
  useEffect(() => {
    if (initialData) {
      // If a date string is provided, try to parse it. Default to now if invalid.
      const parsedDate = initialData.date ? new Date(initialData.date) : new Date();
      setDate(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
      
      setCategory(initialData.category || '');
      setProveedor(initialData.supplier || '');
      setDescripcion(initialData.description || '');
      setImporte(initialData.totalAmount?.toString() || '');
    } else {
        // Reset form when there's no initial data
        setDate(new Date());
        setCategory('');
        setProveedor('');
        setDescripcion('');
        setImporte('');
    }
  }, [initialData]);

  const handleRegister = () => {
    // Here you would typically handle form submission
    toast({
      title: 'Gasto Registrado (Simulación)',
      description: 'El nuevo gasto ha sido añadido a tu lista.',
    });
    onClose();
  };
  
  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const formData = new FormData();
      formData.append('receiptDataUri', base64data);

      const result = await scanReceiptAction(formData);

      setIsScanning(false);
      
      if (result.error) {
          setScanError(result.error);
      } else if (result.data) {
          onOpenModal(result.data);
      }
    };
     // Reset file input to allow selecting the same file again
    event.target.value = '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
          <DialogDescription>
            Completa la información para el nuevo gasto o escanea un ticket.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <Button variant="outline" className="w-full" onClick={handleScanClick} disabled={isScanning}>
                {isScanning ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Escaneando...</>
                ) : (
                    <><ScanLine className="mr-2 h-4 w-4" /> Escanear Ticket con IA</>
                )}
            </Button>
            
            {scanError && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error de Escaneo</AlertTitle>
                    <AlertDescription>{scanError}</AlertDescription>
                </Alert>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Fecha</Label>
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
                <Label htmlFor="category" className="text-right">Categoría</Label>
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
                <Label htmlFor="proveedor" className="text-right">Proveedor</Label>
                <Input id="proveedor" placeholder="Ej: Amazon, Ferretería Paco" className="col-span-3" value={proveedor} onChange={(e) => setProveedor(e.target.value)} />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="descripcion" className="text-right pt-2">Descripción</Label>
                <Textarea id="descripcion" placeholder="Detalles del gasto..." className="col-span-3" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="importe" className="text-right">Importe (€)</Label>
                <Input id="importe" type="number" placeholder="Ej: 75.50" className="col-span-3" value={importe} onChange={(e) => setImporte(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="metodo-pago" className="text-right">Método Pago</Label>
                 <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona un método" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="credit-card">Tarjeta de Crédito</SelectItem>
                        <SelectItem value="debit-card">Tarjeta de Débito</SelectItem>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="bank-transfer">Transferencia</SelectItem>
                        <SelectItem value="paypal">Paypal</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleRegister}>Registrar Gasto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
