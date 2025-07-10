'use client';

import { useState } from 'react';
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
import { CalendarIcon, ScanLine } from 'lucide-react';
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from '@/hooks/use-toast';

interface RegisterExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegisterExpenseModal({ isOpen, onClose }: RegisterExpenseModalProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const handleRegister = () => {
    // Here you would typically handle form submission
    toast({
      title: 'Gasto Registrado (Simulación)',
      description: 'El nuevo gasto ha sido añadido a tu lista.',
    });
    onClose();
  };
  
  const handleScan = () => {
      toast({
          title: "Función no disponible",
          description: "La función de escanear tickets con IA estará disponible próximamente."
      })
  }

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
            <Button variant="outline" className="w-full" onClick={handleScan}>
                <ScanLine className="mr-2 h-4 w-4" />
                Escanear Ticket con IA
            </Button>
            
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
                <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="oficina">Oficina</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="viajes">Viajes</SelectItem>
                        <SelectItem value="suministros">Suministros</SelectItem>
                        <SelectItem value="otros">Otros</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="proveedor" className="text-right">Proveedor</Label>
                <Input id="proveedor" placeholder="Ej: Amazon, Ferretería Paco" className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="descripcion" className="text-right pt-2">Descripción</Label>
                <Textarea id="descripcion" placeholder="Detalles del gasto..." className="col-span-3" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="importe" className="text-right">Importe (€)</Label>
                <Input id="importe" type="number" placeholder="Ej: 75.50" className="col-span-3" />
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
