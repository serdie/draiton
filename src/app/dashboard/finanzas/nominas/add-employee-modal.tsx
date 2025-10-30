

'use client';

import { useState, useContext, useTransition } from 'react';
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
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/context/auth-context';
import { createEmployeeUser } from '@/lib/firebase/admin-actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: () => void;
}

export function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded }: AddEmployeeModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [createdUserInfo, setCreatedUserInfo] = useState<{ message: string; tempPassword?: string } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [nif, setNif] = useState('');
  const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
  const [contractType, setContractType] = useState('');
  const [grossAnnualSalary, setGrossAnnualSalary] = useState('');
  const [hireDate, setHireDate] = useState<Date | undefined>();
  const [paymentFrequency, setPaymentFrequency] = useState('Mensual');


  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPosition('');
    setNif('');
    setSocialSecurityNumber('');
    setContractType('');
    setGrossAnnualSalary('');
    setHireDate(undefined);
    setPaymentFrequency('Mensual');
    setCreatedUserInfo(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    startTransition(async () => {
      const employeeData = {
        name,
        email,
        phone,
        position,
        nif,
        socialSecurityNumber,
        contractType,
        paymentFrequency,
        grossAnnualSalary: parseFloat(grossAnnualSalary),
        hireDate,
        ownerId: user.uid,
      };

      try {
        const result = await createEmployeeUser(employeeData as any);
        if (result && result.message) {
            setCreatedUserInfo({ message: result.message, tempPassword: result.tempPassword });
            onEmployeeAdded();
        } else {
             throw new Error('La acción del servidor no devolvió una respuesta válida.');
        }
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error al crear empleado',
          description: error.message || 'No se pudo crear el empleado. Inténtalo de nuevo.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{createdUserInfo ? 'Empleado Creado' : 'Añadir Nuevo Empleado'}</DialogTitle>
          <DialogDescription>
            {createdUserInfo
              ? 'El empleado ha sido añadido a tu empresa y se ha creado su cuenta.'
              : 'Completa los datos para registrar un nuevo empleado en tu empresa.'}
          </DialogDescription>
        </DialogHeader>

        {createdUserInfo ? (
          <div className="py-4 space-y-4">
            <Alert>
              <AlertTitle>¡Éxito!</AlertTitle>
              <AlertDescription>{createdUserInfo.message}</AlertDescription>
            </Alert>
            {createdUserInfo.tempPassword && (
              <div className="space-y-2">
                <Label>Contraseña Temporal</Label>
                <Input readOnly value={createdUserInfo.tempPassword} />
                <p className="text-xs text-muted-foreground">El empleado deberá usar esta contraseña para su primer inicio de sesión y se le pedirá que la cambie.</p>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleClose}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto -mr-6 pr-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="position">Puesto</Label>
              <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nif">NIF</Label>
                    <Input id="nif" value={nif} onChange={(e) => setNif(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="ssn">Nº Seg. Social</Label>
                    <Input id="ssn" value={socialSecurityNumber} onChange={(e) => setSocialSecurityNumber(e.target.value)} required />
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
                        <Calendar mode="single" selected={hireDate} onSelect={setHireDate} initialFocus />
                    </PopoverContent>
                </Popover>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="contract-type">Tipo de Contrato</Label>
                <Select value={contractType} onValueChange={setContractType} required>
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
            </div>
             <div className="space-y-2">
              <Label htmlFor="salary">Salario Bruto Anual (€)</Label>
              <Input id="salary" type="number" value={grossAnnualSalary} onChange={(e) => setGrossAnnualSalary(e.target.value)} required />
            </div>
             <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Creando...' : 'Crear Empleado'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
