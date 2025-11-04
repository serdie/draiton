
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Fichaje } from './types';
import { Clock, Building, Briefcase, Paperclip, Info, AlertCircle, Calendar, MessageSquare, Coffee } from 'lucide-react';

interface ViewFichajeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fichaje: Fichaje;
}

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-4">
        <div className="text-muted-foreground">{icon}</div>
        <div>
            <p className="font-semibold text-sm">{label}</p>
            <div className="text-sm text-muted-foreground">{value}</div>
        </div>
    </div>
);

export function ViewFichajeModal({ isOpen, onClose, fichaje }: ViewFichajeModalProps) {

  const { breakDetails, workModality, requestStatus } = fichaje;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles del Fichaje</DialogTitle>
          <DialogDescription>
            Información completa del registro seleccionado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">

            <DetailRow 
                icon={<Clock className="h-5 w-5"/>} 
                label="Registro"
                value={<><span className="font-bold">{fichaje.type}</span> a las {format(fichaje.timestamp, 'HH:mm:ss')}</>}
            />
            <DetailRow 
                icon={<Calendar className="h-5 w-5"/>} 
                label="Fecha"
                value={format(fichaje.timestamp, 'PPP', { locale: es })}
            />

            {workModality && (
                <DetailRow 
                    icon={workModality === 'Presencial' ? <Building className="h-5 w-5"/> : <Briefcase className="h-5 w-5"/>} 
                    label="Modalidad de Trabajo"
                    value={<Badge variant="outline">{workModality}</Badge>}
                />
            )}

            {breakDetails && (
                <>
                    <Separator />
                    <DetailRow 
                        icon={<Coffee className="h-5 w-5"/>} 
                        label="Detalles de la Pausa"
                        value={
                            <ul className="list-disc list-inside space-y-1">
                                {breakDetails.isSplitShift && <li>Pausa de jornada partida</li>}
                                {breakDetails.isPersonal && <li>Pausa personal</li>}
                                {breakDetails.isJustified && (
                                    <li>Pausa justificada: <strong>{breakDetails.justificationType}</strong></li>
                                )}
                            </ul>
                        }
                    />
                    {breakDetails.moreInfo && (
                         <DetailRow 
                            icon={<Info className="h-5 w-5"/>} 
                            label="Información Adicional"
                            value={<p className="italic">"{breakDetails.moreInfo}"</p>}
                        />
                    )}
                </>
            )}

            {requestStatus && (
                <>
                     <Separator />
                     <DetailRow 
                        icon={<AlertCircle className="h-5 w-5"/>} 
                        label="Solicitud de Cambio"
                        value={
                             <div className="space-y-1">
                                <Badge variant={requestStatus === 'approved' ? 'default' : requestStatus === 'rejected' ? 'destructive' : 'secondary'}>
                                    {requestStatus.charAt(0).toUpperCase() + requestStatus.slice(1)}
                                </Badge>
                                <p>Hora solicitada: {format(fichaje.requestedTimestamp!, 'HH:mm')}</p>
                                {fichaje.requestChangeReason && <p className="italic">Motivo: "{fichaje.requestChangeReason}"</p>}
                            </div>
                        }
                    />
                </>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
