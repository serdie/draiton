
'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Briefcase, Building } from 'lucide-react';

interface SelectWorkModalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (modality: 'Presencial' | 'Teletrabajo') => void;
}

export function SelectWorkModalityModal({ isOpen, onClose, onSelect }: SelectWorkModalityModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modalidad de Trabajo</DialogTitle>
          <DialogDescription>
            ¿Cómo vas a empezar tu jornada de hoy?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => onSelect('Presencial')}
            >
                <Building className="h-6 w-6" />
                <span>Presencial</span>
            </Button>
            <Button
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => onSelect('Teletrabajo')}
            >
                <Briefcase className="h-6 w-6" />
                <span>Teletrabajo</span>
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    