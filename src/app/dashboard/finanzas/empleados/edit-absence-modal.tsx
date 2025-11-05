
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EditAbsenceForm } from './edit-absence-form';
import type { Employee, Absence } from './types';

interface EditAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  absence: Absence;
  employees: Employee[];
}

export function EditAbsenceModal({ isOpen, onClose, absence, employees }: EditAbsenceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Ausencia</DialogTitle>
          <DialogDescription>
            Modifica los detalles del registro de ausencia.
          </DialogDescription>
        </DialogHeader>
        <EditAbsenceForm
            absence={absence}
            employees={employees}
            onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
