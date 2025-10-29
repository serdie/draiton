
'use client';

import { useState, useTransition } from 'react';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Employee } from './types';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export function EditEmployeeModal({ isOpen, onClose, employee }: EditEmployeeModalProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state initialized from employee prop
  const [name, setName] = useState(employee.name);
  const [email, setEmail] = useState(employee.email);
  const [position, setPosition] = useState(employee.position);
  const [nif, setNif] = useState(employee.nif);
  const [socialSecurityNumber, setSocialSecurityNumber] = useState(employee.socialSecurityNumber);
  const [contractType, setContractType] = useState(employee.contractType);
  const [grossAnnualSalary, setGrossAnnualSalary] = useState(String(employee.grossAnnualSalary));
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const updatedData = {
        name,
        email,
        position,
        nif,
        socialSecurityNumber,
        contractType,
        grossAnnualSalary: parseFloat(grossAnnualSalary),
      };

      try {
        const employeeRef = doc(db, "employees", employee.id);
        await updateDoc(employeeRef, updatedData);

        const userRef = doc(db, "users", employee.id);
        await updateDoc(userRef, { displayName: name, email: email });
        
        toast({
          title: 'Empleado Actualizado',
          description: `Los datos de ${name} se han guardado correctamente.`,
        });
        onClose();

      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error al actualizar',
          description: error.message || 'No se pudo actualizar el empleado.',
        });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Empleado</DialogTitle>
          <DialogDescription>
            Modifica los datos de {employee.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto -mr-6 pr-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre Completo</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
              <Label htmlFor="edit-salary">Salario Bruto Anual (€)</Label>
              <Input id="edit-salary" type="number" value={grossAnnualSalary} onChange={(e) => setGrossAnnualSalary(e.target.value)} required />
            </div>
             <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
