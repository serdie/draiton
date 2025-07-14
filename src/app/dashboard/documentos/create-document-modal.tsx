
'use client';

import {
  Dialog,
  DialogContent,
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
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <CreateDocumentForm 
            onClose={onClose} 
            documentType={documentType}
            initialData={initialData}
            />
      </DialogContent>
    </Dialog>
  );
}
