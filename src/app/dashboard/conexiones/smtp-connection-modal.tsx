
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SmtpConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SmtpConnectionModal({ isOpen, onClose }: SmtpConnectionModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call to test and save credentials
    setTimeout(() => {
        setIsLoading(false);
        toast({
            title: `Conexión SMTP guardada (Simulación)`,
            description: 'Tu servidor de correo ha sido configurado.',
        });
        onClose();
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Conexión SMTP</DialogTitle>
          <DialogDescription>
            Introduce los detalles de tu servidor de correo para enviar emails a través de tu propia cuenta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSaveConnection}>
            <div className="py-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="smtp-host">Host</Label>
                        <Input id="smtp-host" placeholder="smtp.example.com" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="smtp-port">Puerto</Label>
                        <Input id="smtp-port" type="number" placeholder="587" required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="smtp-user">Usuario</Label>
                    <Input id="smtp-user" placeholder="tu@email.com" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="smtp-password">Contraseña</Label>
                    <Input id="smtp-password" type="password" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="smtp-security">Seguridad</Label>
                    <Select defaultValue="tls">
                        <SelectTrigger id="smtp-security">
                            <SelectValue placeholder="Seleccionar seguridad" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tls">STARTTLS</SelectItem>
                            <SelectItem value="ssl">SSL/TLS</SelectItem>
                             <SelectItem value="none">Ninguna</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Probar y Guardar
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
