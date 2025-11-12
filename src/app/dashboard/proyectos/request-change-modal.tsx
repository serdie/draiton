
'use client';

import { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Fichaje } from './types';
import { AuthContext } from '@/context/auth-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface RequestChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fichaje: Fichaje;
}

export function RequestChangeModal({ isOpen, onClose, fichaje }: RequestChangeModalProps) {
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');
  
  // States for new date and time
  const [newDate, setNewDate] = useState<Date | undefined>(fichaje.timestamp);
  const [newTime, setNewTime] = useState(format(fichaje.timestamp, 'HH:mm'));

  const handleSubmit = async () => {
    if (!reason || !newTime || !newDate) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Debes indicar la nueva fecha, la hora y el motivo del cambio.',
      });
      return;
    }
     if (!user || !(user as any).companyOwnerId) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudo identificar a tu empresa.' });
      return;
    }
    
    setIsLoading(true);
    
    // Combine date and time
    const [hours, minutes] = newTime.split(':').map(Number);
    const newTimestamp = new Date(newDate);
    newTimestamp.setHours(hours, minutes, 0, 0); // Set seconds and ms to 0

    const fichajeRef = doc(db, 'fichajes', fichaje.id);
    try {
      await updateDoc(fichajeRef, {
        requestedTimestamp: newTimestamp,
        requestChangeReason: reason,
        requestStatus: 'pending',
        requestedAt: new Date(),
        requesterId: user.uid,
        requesterName: user.displayName,
      });

      // Crear notificación para el dueño de la empresa
      await addDoc(collection(db, 'notifications'), {
        recipientId: (user as any).companyOwnerId,
        senderId: user.uid,
        senderName: user.displayName,
        type: 'FICHAGE_CHANGE_REQUEST',
        message: 'ha solicitado un cambio en un fichaje.',
        link: '/dashboard/finanzas?tab=empleados',
        isRead: false,
        createdAt: serverTimestamp(),
      });


      toast({
        title: 'Solicitud Enviada',
        description: 'Tu solicitud de cambio ha sido enviada para su revisión.',
      });
      onClose();
    } catch (error) {
      console.error("Error al solicitar cambio de fichaje:", error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo enviar tu solicitud. Inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Cambio de Fichaje</DialogTitle>
          <DialogDescription>
            Propón un cambio para tu registro de <span className="font-semibold">{fichaje.type}</span> del {format(fichaje.timestamp, 'PPP', { locale: es })}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                    <Label>Registro Original</Label>
                    <Input readOnly value={format(fichaje.timestamp, 'dd/MM/yy HH:mm:ss')} className="font-mono bg-muted"/>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="new-date">Nueva Fecha Propuesta</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="new-date"
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !newDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {newDate ? format(newDate, "dd/MM/yyyy") : <span>Elige una fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={newDate} onSelect={setNewDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div>
                        <Label htmlFor="new-time">Nueva Hora Propuesta</Label>
                        <Input id="new-time" type="time" value={newTime} onChange={e => setNewTime(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="reason">Motivo de la solicitud</Label>
                <Textarea 
                    id="reason" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    placeholder="Ej: Olvidé fichar al llegar, mi hora real de entrada fue..."
                />
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
