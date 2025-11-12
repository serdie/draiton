
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Expense } from './page';

interface EditExpenseFormProps {
  onClose: () => void;
  expense: Expense;
}

export function EditExpenseForm({ onClose, expense }: EditExpenseFormProps) {
  const { toast } = useToast();
  const [isSaving, startTransition] = useTransition();

  const [date, setDate] = useState<Date | undefined>(expense.fecha);
  const [category, setCategory] = useState<string>(expense.categoria);
  const [proveedor, setProveedor] = useState(expense.proveedor);
  const [descripcion, setDescripcion] = useState(expense.descripcion);
  const [importe, setImporte] = useState(String(expense.importe));
  const [metodoPago, setMetodoPago] = useState(expense.metodoPago);

  useEffect(() => {
    setDate(expense.fecha);
    setCategory(expense.categoria);
    setProveedor(expense.proveedor);
    setDescripcion(expense.descripcion);
    setImporte(String(expense.importe));
    setMetodoPago(expense.metodoPago);
  }, [expense]);

  const handleUpdate = () => {
    startTransition(async () => {
        if (!date || !category || !proveedor || !importe || !metodoPago) {
            toast({ variant: 'destructive', title: 'Campos requeridos' });
            return;
        }

        const expenseRef = doc(db, "expenses", expense.id);
        const updatedData = {
            fecha: date,
            categoria: category,
            proveedor: proveedor,
            descripcion: descripcion,
            importe: parseFloat(importe),
            metodoPago: metodoPago,
        };

        try {
            await updateDoc(expenseRef, updatedData);
            toast({ title: 'Gasto Actualizado', description: 'El gasto ha sido actualizado correctamente.' });
            onClose();
        } catch (error) {
            console.error("Error al actualizar gasto: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el gasto.' });
        }
    });
  };

  return (
    <div className="py-4 space-y-4">
        <div className="space-y-2">
            <Label htmlFor="edit-date">Fecha *</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", {locale: es}) : <span>Elige una fecha</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
            </Popover>
        </div>
        <div className="space-y-2">
            <Label htmlFor="edit-category">Categoría *</Label>
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
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
        <div className="space-y-2">
            <Label htmlFor="edit-proveedor">Proveedor *</Label>
            <Input id="edit-proveedor" value={proveedor} onChange={(e) => setProveedor(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="edit-descripcion">Descripción</Label>
            <Textarea id="edit-descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="edit-importe">Importe (€) *</Label>
            <Input id="edit-importe" type="number" value={importe} onChange={(e) => setImporte(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="edit-metodo-pago">Método de Pago *</Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
                <SelectTrigger><SelectValue placeholder="Selecciona un método" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                    <SelectItem value="Paypal">Paypal</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
            </Button>
        </div>
    </div>
  );
}
