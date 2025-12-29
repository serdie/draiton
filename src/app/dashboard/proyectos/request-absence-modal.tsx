
'use client';

import { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';
import type { AbsenceType, AbsenceStatus } from '../finanzas/empleados/types';
import type { DateRange } from 'react-day-picker';

interface RequestAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const absenceTypes: AbsenceType[] = ['Vacaciones', 'Baja por enfermedad', 'Paternidad/Maternidad', 'Día propio', 'Otro'];

export function RequestAbsenceModal({ isOpen, onClose }: RequestAbsenceModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [type, setType] = useState<AbsenceType>('Vacaciones');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setType('Vacaciones');
    setDateRange(undefined);
    setNotes('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleSubmit = async () => {
    if (!dateRange?.from) {
      toast({
        variant: 'destructive',
        title: 'Campo Requerido',
        description: 'Debes seleccionar al menos una fecha de inicio.',
      });
      return;
    }
    if (!user || !(user as any).companyOwnerId) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo identificar a tu empresa.' });
      return;
    }

    setIsLoading(true);
    
    try {
        await addDoc(collection(db, 'absences'), {
            ownerId: (user as any).companyOwnerId,
            employeeId: user.uid,
            type,
            startDate: dateRange.from,
            endDate: dateRange.to || dateRange.from,
            status: 'Pendiente', // Always pending when requested by employee
            notes,
            createdAt: serverTimestamp(),
        });

        // Crear notificación para el dueño de la empresa
        await addDoc(collection(db, 'notifications'), {
            recipientId: (user as any).companyOwnerId,
            senderId: user.uid,
            senderName: user.displayName,
            type: 'FICHAGE_CHANGE_REQUEST', // We can reuse this or create a new one
            message: 'ha solicitado un permiso de ausencia.',
            link: '/dashboard/finanzas?tab=empleados', // Link for owner to manage absences
            isRead: false,
            createdAt: serverTimestamp(),
        });
        
        toast({
            title: 'Solicitud Enviada',
            description: 'Tu solicitud de ausencia ha sido enviada para su aprobación.',
        });
      
        handleClose();

    } catch (error) {
      console.error("Error al registrar ausencia: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar tu solicitud. Revisa los permisos de Firestore.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Ausencia</DialogTitle>
          <DialogDescription>
            Pide tus días libres. Tu solicitud será revisada por la empresa.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="absence-type">Tipo de Ausencia</Label>
            <Select value={type} onValueChange={(v) => setType(v as AbsenceType)}>
              <SelectTrigger id="absence-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {absenceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
             <Label>Periodo de Ausencia</Label>
             <Popover>
                <PopoverTrigger asChild>
                <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "dd LLL, y", { locale: es })} - {format(dateRange.to, "dd LLL, y", { locale: es })}</>) : (format(dateRange.from, "dd LLL, y", { locale: es }))) : (<span>Elige un rango de fechas</span>)}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es}/>
                </PopoverContent>
            </Popover>
           </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Añade un comentario para tu solicitud..."/>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
