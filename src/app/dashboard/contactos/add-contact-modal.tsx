'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddContactForm } from './add-contact-form';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddContactModal({ isOpen, onClose }: AddContactModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Contacto</DialogTitle>
          <DialogDescription>
            Completa la información para el nuevo contacto.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddContactForm onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
