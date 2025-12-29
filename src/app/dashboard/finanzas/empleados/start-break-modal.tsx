
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { BreakDetails } from './types';

interface StartBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: BreakDetails) => void;
  isSubmitting: boolean;
}

export function StartBreakModal({ isOpen, onClose, onSubmit, isSubmitting }: StartBreakModalProps) {
  const [isSplitShift, setIsSplitShift] = useState(false);
  const [isPersonal, setIsPersonal] = useState(false);
  const [moreInfo, setMoreInfo] = useState('');
  const [isJustified, setIsJustified] = useState(false);
  const [justificationType, setJustificationType] = useState<'Visita medica' | 'Tratamiento' | 'Gestiones administrativas' | 'Tutoria' | 'Otros' | undefined>(undefined);
  
  const resetState = () => {
    setIsSplitShift(false);
    setIsPersonal(false);
    setMoreInfo('');
    setIsJustified(false);
    setJustificationType(undefined);
  }

  const handleClose = () => {
    resetState();
    onClose();
  }

  const handleSubmit = () => {
    const details: BreakDetails = {
      isSplitShift,
      isPersonal,
      isJustified,
      justificationType: isJustified ? justificationType : undefined,
      moreInfo: moreInfo,
    };
    onSubmit(details);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles de la Pausa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="split-shift" checked={isSplitShift} onCheckedChange={c => setIsSplitShift(c as boolean)} />
            <Label htmlFor="split-shift">Pausa jornada partida</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="personal-break" checked={isPersonal} onCheckedChange={c => setIsPersonal(c as boolean)} />
            <Label htmlFor="personal-break">Pausa personal</Label>
          </div>
          <Textarea 
            placeholder="Más información..." 
            value={moreInfo}
            onChange={(e) => setMoreInfo(e.target.value)}
          />
          <div className="flex items-center space-x-2">
            <Checkbox id="justified-break" checked={isJustified} onCheckedChange={c => setIsJustified(c as boolean)} />
            <Label htmlFor="justified-break">Pausa Justificada</Label>
          </div>
          {isJustified && (
            <Select onValueChange={(v) => setJustificationType(v as any)} value={justificationType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Visita medica">Visita médica</SelectItem>
                <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                <SelectItem value="Gestiones administrativas">Gestiones administrativas</SelectItem>
                <SelectItem value="Tutoria">Tutoría</SelectItem>
                <SelectItem value="Otros">Otros</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aceptar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
