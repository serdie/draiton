
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
import { collection, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';
import type { Employee, AbsenceType, AbsenceStatus } from './types';
import type { DateRange } from 'react-day-picker';

interface RegisterAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
}

const absenceTypes: AbsenceType[] = ['Vacaciones', 'Baja por enfermedad', 'Paternidad/Maternidad', 'Día propio', 'Festivo', 'Otro'];
const absenceStatuses: AbsenceStatus[] = ['Aprobada', 'Pendiente', 'Rechazada'];

export function RegisterAbsenceModal({ isOpen, onClose, employees }: RegisterAbsenceModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [employeeId, setEmployeeId] = useState<string>('');
  const [type, setType] = useState<AbsenceType>('Vacaciones');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [status, setStatus] = useState<AbsenceStatus>('Aprobada');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setEmployeeId('');
    setType('Vacaciones');
    setDateRange(undefined);
    setStatus('Aprobada');
    setNotes('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  }

  const handleRegisterAbsence = async () => {
    if (!employeeId || !dateRange?.from) {
      toast({
        variant: 'destructive',
        title: 'Campos Requeridos',
        description: 'Debes seleccionar un empleado y al menos una fecha de inicio.',
      });
      return;
    }
    if (!user) return;

    setIsLoading(true);
    
    try {
        if (employeeId === 'all') {
            // Batch write for all employees
            const batch = writeBatch(db);
            employees.forEach(employee => {
                const absenceRef = doc(collection(db, 'absences'));
                batch.set(absenceRef, {
                    ownerId: user.uid,
                    employeeId: employee.id,
                    type,
                    startDate: dateRange.from,
                    endDate: dateRange.to || dateRange.from,
                    status,
                    notes,
                    createdAt: serverTimestamp(),
                });
            });
            await batch.commit();
            toast({
                title: 'Ausencias Registradas',
                description: `Se ha registrado la ausencia para todos los empleados.`,
            });
        } else {
            // Single write for one employee
            await addDoc(collection(db, 'absences'), {
                ownerId: user.uid,
                employeeId,
                type,
                startDate: dateRange.from,
                endDate: dateRange.to || dateRange.from,
                status,
                notes,
                createdAt: serverTimestamp(),
            });
             toast({
                title: 'Ausencia Registrada',
                description: 'La ausencia ha sido guardada en el calendario del empleado.',
            });
        }
      
        handleClose();

    } catch (error) {
      console.error("Error al registrar ausencia: ", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar la ausencia. Revisa los permisos de Firestore.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Ausencia</DialogTitle>
          <DialogDescription>
            Añade un periodo de ausencia para uno o todos los empleados.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Empleado</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger id="employee">
                <SelectValue placeholder="Selecciona un empleado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los empleados</SelectItem>
                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
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
            <Label htmlFor="absence-status">Estado</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as AbsenceStatus)}>
              <SelectTrigger id="absence-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {absenceStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Añadir notas relevantes..."/>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleRegisterAbsence} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
