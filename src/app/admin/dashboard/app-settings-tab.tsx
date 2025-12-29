
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, AlertTriangle, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function AppSettingsTab() {
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: 'Configuración Guardada',
      description: 'Los ajustes generales de la aplicación han sido actualizados.',
    });
  };

   const handleSendAnnouncement = () => {
    toast({
      title: 'Anuncio Enviado (Simulación)',
      description: 'El anuncio ha sido enviado a todos los usuarios.',
    });
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Ajustes Generales de la Aplicación</CardTitle>
                <CardDescription>Controla funciones globales y el estado de la aplicación.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="maintenance-mode" className="text-base font-medium">Modo Mantenimiento</Label>
                        <p className="text-sm text-muted-foreground">
                            Activa esta opción para mostrar un banner de mantenimiento a todos los usuarios.
                        </p>
                    </div>
                     <Switch id="maintenance-mode" />
                </div>

                 <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="allow-registration" className="text-base font-medium">Permitir Nuevos Registros</Label>
                        <p className="text-sm text-muted-foreground">
                            Desactiva esta opción para impedir que nuevos usuarios se registren.
                        </p>
                    </div>
                     <Switch id="allow-registration" defaultChecked />
                </div>
                 <Button onClick={handleSaveSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Ajustes
                 </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Enviar Anuncio Global</CardTitle>
                <CardDescription>
                    Comunícate con todos los usuarios de la aplicación. El anuncio aparecerá como una notificación tipo toast.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="announcement-message">Mensaje del Anuncio</Label>
                    <Textarea id="announcement-message" placeholder="Ej: La plataforma estará en mantenimiento el domingo a las 2AM." rows={3} />
                </div>
                 <Button onClick={handleSendAnnouncement}>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Anuncio
                 </Button>
            </CardContent>
        </Card>
    </div>
  );
}
