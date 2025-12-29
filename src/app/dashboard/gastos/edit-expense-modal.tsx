
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EditExpenseForm } from './edit-expense-form';
import type { Expense } from './page';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
}

export function EditExpenseModal({ isOpen, onClose, expense }: EditExpenseModalProps) {
  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
          <DialogDescription>
            Modifica los detalles del gasto seleccionado.
          </DialogDescription>
        </DialogHeader>
        <EditExpenseForm expense={expense} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}
