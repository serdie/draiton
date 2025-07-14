
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreateDocumentForm } from './create-document-form';
import type { DocumentType } from './page';
import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
  initialData?: ExtractInvoiceDataOutput;
}

export function CreateDocumentModal({ isOpen, onClose, documentType, initialData }: CreateDocumentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Documento</DialogTitle>
          <DialogDescription>
            Completa los detalles para crear un nuevo documento de tipo {documentType}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
            <div className="py-4 pr-2">
              <CreateDocumentForm 
                onClose={onClose} 
                documentType={documentType}
                initialData={initialData}
              />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
