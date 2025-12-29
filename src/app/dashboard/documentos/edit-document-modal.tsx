
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EditDocumentForm } from './edit-document-form';
import type { Document } from './page';

interface EditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

const getDocumentTypeLabel = (type: Document['tipo']) => {
    switch (type) {
        case 'factura': return 'Factura';
        case 'presupuesto': return 'Presupuesto';
        case 'nota-credito': return 'Nota de Crédito';
    }
}

export function EditDocumentModal({ isOpen, onClose, document }: EditDocumentModalProps) {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar {getDocumentTypeLabel(document.tipo)}</DialogTitle>
          <DialogDescription>
            Modifica los detalles del documento <span className="font-semibold">{document.numero}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            <div className="py-4 pr-2">
                <EditDocumentForm document={document} onClose={onClose} />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
