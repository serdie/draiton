
'use client';

import { useState, useEffect } from 'react';
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
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export function EditEmployeeModal({ isOpen, onClose, employee }: EditEmployeeModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState(employee.name);
  const [position, setPosition] = useState(employee.position);
  const [nif, setNif] = useState(employee.nif);
  const [socialSecurityNumber, setSocialSecurityNumber] = useState(employee.socialSecurityNumber);
  const [contractType, setContractType] = useState<Employee['contractType']>(employee.contractType);
  const [grossAnnualSalary, setGrossAnnualSalary] = useState(employee.grossAnnualSalary.toString());

  useEffect(() => {
    setName(employee.name);
    setPosition(employee.position);
    setNif(employee.nif);
    setSocialSecurityNumber(employee.socialSecurityNumber);
    setContractType(employee.contractType);
    setGrossAnnualSalary(employee.grossAnnualSalary.toString());
  }, [employee]);

  const handleUpdateEmployee = async () => {
    if (!name || !position || !nif || !socialSecurityNumber || !grossAnnualSalary) {
      toast({
        variant: 'destructive',
        title: 'Campos incompletos',
        description: 'Por favor, rellena todos los campos obligatorios.',
      });
      return;
    }
    setIsLoading(true);
    
    const employeeRef = doc(db, 'employees', employee.id);
    const updatedEmployeeData = {
        name,
        position,
        nif,
        socialSecurityNumber,
        contractType,
        grossAnnualSalary: parseFloat(grossAnnualSalary),
    };
    
    try {
      await updateDoc(employeeRef, updatedEmployeeData);
      toast({
          title: 'Empleado Actualizado',
          description: `Los datos de ${name} han sido guardados.`,
      });
      onClose();
    } catch(error) {
      console.error("Error al actualizar empleado:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron guardar los cambios.'});
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
          <DialogDescription>
            Modifica los datos de {employee.name}.
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
          <Button onClick={handleUpdateEmployee} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
