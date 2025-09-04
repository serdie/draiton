
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Employee } from './page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';
import { createEmployeeUser } from '@/lib/firebase/admin-actions';


interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeAdded: () => void;
}

export function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded }: AddEmployeeModalProps) {
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [nif, setNif] = useState('');
  const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
  const [contractType, setContractType] = useState<Employee['contractType']>('Indefinido');
  const [grossAnnualSalary, setGrossAnnualSalary] = useState('');

  const resetForm = () => {
    setName('');
    setPosition('');
    setEmail('');
    setNif('');
    setSocialSecurityNumber('');
    setContractType('Indefinido');
    setGrossAnnualSalary('');
  };

  const handleAddEmployee = async () => {
    if (!name || !position || !nif || !socialSecurityNumber || !grossAnnualSalary || !email) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, rellena todos los campos obligatorios.',
      });
      return;
    }
    if (!user) {
        toast({ variant: 'destructive', title: 'Error de autenticación', description: 'Debes iniciar sesión para añadir un empleado.' });
        return;
    }

    setIsLoading(true);
    
    const newEmployeeData = {
        ownerId: user.uid,
        name,
        position,
        nif,
        socialSecurityNumber,
        contractType,
        grossAnnualSalary: parseFloat(grossAnnualSalary),
        email,
    };

    try {
        const result = await createEmployeeUser(newEmployeeData);

        toast({
            title: 'Empleado Creado/Vinculado',
            description: result.message,
            duration: 10000,
        });

        onEmployeeAdded();
        resetForm();
        onClose();
    } catch (error: any) {
        console.error("Error al añadir empleado:", error);
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'No se pudo guardar el empleado.'});
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Empleado</DialogTitle>
          <DialogDescription>
            Introduce los datos del nuevo empleado para gestionar sus nóminas. Se creará un nuevo usuario para él/ella.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="position">Puesto de Trabajo</Label>
                <Input id="position" value={position} onChange={e => setPosition(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="nif">NIF / NIE</Label>
                <Input id="nif" value={nif} onChange={e => setNif(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="ssn">Nº Seguridad Social</Label>
                <Input id="ssn" value={socialSecurityNumber} onChange={e => setSocialSecurityNumber(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="contractType">Tipo de Contrato</Label>
                 <Select value={contractType} onValueChange={(value) => setContractType(value as any)}>
                    <SelectTrigger id="contractType">
                        <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Indefinido">Indefinido</SelectItem>
                        <SelectItem value="Temporal">Temporal</SelectItem>
                        <SelectItem value="Formación">Formación</SelectItem>
                        <SelectItem value="Prácticas">Prácticas</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="salary">Salario Bruto Anual (€)</Label>
                <Input id="salary" type="number" value={grossAnnualSalary} onChange={e => setGrossAnnualSalary(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleAddEmployee} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Añadir Empleado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
