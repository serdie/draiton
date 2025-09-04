
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Employee } from './page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
}

export function AddEmployeeModal({ isOpen, onClose, onAddEmployee }: AddEmployeeModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [nif, setNif] = useState('');
  const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
  const [contractType, setContractType] = useState<Employee['contractType']>('Indefinido');
  const [grossAnnualSalary, setGrossAnnualSalary] = useState('');

  const handleSubmit = () => {
    if (!name || !position || !nif || !socialSecurityNumber || !grossAnnualSalary) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, rellena todos los campos obligatorios.',
      });
      return;
    }
    setIsLoading(true);
    
    const newEmployee = {
        name,
        position,
        nif,
        socialSecurityNumber,
        contractType,
        grossAnnualSalary: parseFloat(grossAnnualSalary),
    };
    
    onAddEmployee(newEmployee);

    setTimeout(() => {
         toast({
            title: 'Empleado Añadido',
            description: `${name} ha sido añadido a la lista de empleados.`,
        });
        setIsLoading(false);
        onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Empleado</DialogTitle>
          <DialogDescription>
            Introduce los datos del nuevo empleado para gestionar sus nóminas.
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
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Añadir Empleado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
