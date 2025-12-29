
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EditContactForm } from './edit-contact-form';
import type { Contact } from './page';

interface EditContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
}

export function EditContactModal({ isOpen, onClose, contact }: EditContactModalProps) {
  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Contacto</DialogTitle>
          <DialogDescription>
            Modifica la información de <span className="font-semibold">{contact.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            <div className="py-4 pr-2">
                <EditContactForm contact={contact} onClose={onClose} />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
