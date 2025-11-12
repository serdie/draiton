

'use client';

import { useState, useTransition, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Timestamp } from 'firebase/firestore';
import type { Employee } from '../types';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { updateEmployeeAction } from '@/lib/firebase/admin-actions';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { EmployeePortalCard } from './employee-portal-card';

interface EditEmployeeFormProps {
  onClose: () => void;
  employee: Employee;
}

export function EditEmployeeForm({ onClose, employee }: EditEmployeeFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state initialized from employee prop
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [phone, setPhone] = useState(employee.phone || '');
  const [position, setPosition] = useState(employee.position);
  const [nif, setNif] = useState(employee.nif);
  const [socialSecurityNumber, setSocialSecurityNumber] = useState(employee.socialSecurityNumber);
  const [contractType, setContractType] = useState(employee.contractType);
  const [workModality, setWorkModality] = useState(employee.workModality || 'Presencial');
  const [weeklyHours, setWeeklyHours] = useState(String(employee.weeklyHours || 40));
  const [paymentFrequency, setPaymentFrequency] = useState(employee.paymentFrequency || 'Mensual');
  const [grossAnnualSalary, setGrossAnnualSalary] = useState(String(employee.grossAnnualSalary));
  const [proratedExtraPays, setProratedExtraPays] = useState(employee.proratedExtraPays ?? true);
  const [hireDate, setHireDate] = useState<Date | undefined>(() => {
    if (!employee.hireDate) return undefined;
    const date = employee.hireDate instanceof Timestamp ? employee.hireDate.toDate() : new Date(employee.hireDate);
    return isValid(date) ? date : undefined;
  });

  useEffect(() => {
    setName(employee.name);
    setEmail(employee.email);
    setPhone(employee.phone || '');
    setPosition(employee.position);
    setNif(employee.nif);
    setSocialSecurityNumber(employee.socialSecurityNumber);
    setContractType(employee.contractType);
    setWorkModality(employee.workModality || 'Presencial');
    setWeeklyHours(String(employee.weeklyHours || 40));
    setPaymentFrequency(employee.paymentFrequency || 'Mensual');
    setGrossAnnualSalary(String(employee.grossAnnualSalary));
    setProratedExtraPays(employee.proratedExtraPays ?? true);
    if (employee.hireDate) {
      const date = employee.hireDate instanceof Timestamp ? employee.hireDate.toDate() : new Date(employee.hireDate);
       if (isValid(date)) {
        setHireDate(date);
      }
    } else {
        setHireDate(undefined);
    }
  }, [employee]);
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const updatedData = {
        name,
        email,
        phone,
        position,
        nif,
        socialSecurityNumber,
        contractType,
        workModality,
        weeklyHours: parseInt(weeklyHours, 10),
        paymentFrequency,
        grossAnnualSalary: parseFloat(grossAnnualSalary),
        proratedExtraPays,
        hireDate: hireDate || null,
      };

      const result = await updateEmployeeAction(employee.id, updatedData);

      if (result.success) {
         toast({
          title: 'Empleado Actualizado',
          description: `Los datos de ${name} se han guardado correctamente.`,
        });
        onClose();
      } else {
         toast({
          variant: 'destructive',
          title: 'Error al actualizar',
          description: result.error || 'No se pudo actualizar el empleado.',
        });
      }
    });
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre Completo</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <Label htmlFor="edit-email">Correo Electrónico</Label>
            <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
            <Label htmlFor="edit-phone">Teléfono</Label>
            <Input id="edit-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
        </div>
            <div className="space-y-2">
            <Label htmlFor="edit-position">Puesto</Label>
            <Input id="edit-position" value={position} onChange={(e) => setPosition(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="edit-nif">NIF</Label>
                <Input id="edit-nif" value={nif} onChange={(e) => setNif(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="edit-ssn">Nº Seg. Social</Label>
                <Input id="edit-ssn" value={socialSecurityNumber} onChange={(e) => setSocialSecurityNumber(e.target.value)} required />
            </div>
        </div>
            <div className="space-y-2">
            <Label htmlFor="hire-date">Fecha de Contratación</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !hireDate && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {hireDate ? format(hireDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={hireDate}
                        onSelect={setHireDate}
                        captionLayout="dropdown-buttons"
                        fromYear={1980}
                        toYear={new Date().getFullYear()}
                        initialFocus
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
        </div>
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="edit-contract-type">Tipo de Contrato</Label>
                <Select value={contractType} onValueChange={(v) => setContractType(v as any)} required>
                    <SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Indefinido">Indefinido</SelectItem>
                    <SelectItem value="Temporal">Temporal</SelectItem>
                    <SelectItem value="Formación">Formación</SelectItem>
                    <SelectItem value="Prácticas">Prácticas</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="work-modality">Modalidad de Trabajo</Label>
                <Select value={workModality} onValueChange={(v) => setWorkModality(v as any)} required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Presencial">Presencial</SelectItem>
                        <SelectItem value="Mixto">Mixto</SelectItem>
                        <SelectItem value="Teletrabajo">Teletrabajo</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
         <div className="space-y-2">
            <Label htmlFor="payment-frequency">Frecuencia de Pago</Label>
                <Select value={paymentFrequency} onValueChange={setPaymentFrequency} required>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Mensual">Mensual</SelectItem>
                    <SelectItem value="Diario">Diario</SelectItem>
                    <SelectItem value="Semanal">Semanal</SelectItem>
                    <SelectItem value="Quincenal">Quincenal</SelectItem>
                    <SelectItem value="Personalizar">Personalizar</SelectItem>
                </SelectContent>
            </Select>
        </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-salary">Salario Bruto Anual (€)</Label>
                    <Input id="edit-salary" type="number" value={grossAnnualSalary} onChange={(e) => setGrossAnnualSalary(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-weekly-hours">Horas Semanales</Label>
                    <Input id="edit-weekly-hours" type="number" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} required />
                </div>
            </div>
        <div className="flex items-center space-x-2">
            <Checkbox id="edit-prorated-pays" checked={proratedExtraPays} onCheckedChange={(checked) => setProratedExtraPays(checked as boolean)} />
            <Label htmlFor="edit-prorated-pays" className="text-sm font-normal">Prorratear pagas extra en la nómina mensual</Label>
        </div>
        
        <Separator className="my-6" />

        <EmployeePortalCard employee={employee} />
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
        </div>
    </form>
  );
}
