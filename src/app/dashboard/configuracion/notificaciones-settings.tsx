
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

type NotificationSettingProps = {
    title: string;
    description: string;
}

function NotificationSetting({ title, description }: NotificationSettingProps) {
    const id = title.replace(/\s+/g, '-').toLowerCase();
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5 mb-2 sm:mb-0">
                <Label htmlFor={id} className="text-base">{title}</Label>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                    <Switch id={`${id}-app`} defaultChecked />
                    <Label htmlFor={`${id}-app`} className="text-sm">En la app</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Switch id={`${id}-email`} defaultChecked/>
                    <Label htmlFor={`${id}-email`} className="text-sm">Email</Label>
                </div>
            </div>
        </div>
    )
}


export function NotificacionesSettings() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({ title: "Preferencias guardadas", description: "Tu configuración de notificaciones ha sido actualizada." });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Notificaciones</CardTitle>
        <CardDescription>Elige cómo y cuándo recibes notificaciones para mantenerte al día.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Facturación</h3>
            <NotificationSetting 
                title="Factura Pagada"
                description="Cuando un cliente paga una de tus facturas."
            />
             <NotificationSetting 
                title="Factura Vencida"
                description="Cuando una factura supera su fecha de vencimiento."
            />
        </div>

        <Separator />

        <div className="space-y-4">
            <h3 className="font-medium text-lg">Proyectos</h3>
            <NotificationSetting 
                title="Tarea Completada"
                description="Cuando un colaborador marca una tarea como completada."
            />
             <NotificationSetting 
                title="Nuevo Comentario"
                description="Cuando alguien comenta en un proyecto en el que participas."
            />
        </div>

         <Separator />

         <div className="space-y-4">
            <h3 className="font-medium text-lg">Marketing y Contactos</h3>
            <NotificationSetting 
                title="Nuevo Suscriptor"
                description="Cuando alguien se suscribe a tu lista de correo."
            />
        </div>

        <Separator />

        <div className="flex justify-start">
            <Button onClick={handleSave}>Guardar Preferencias</Button>
        </div>
      </CardContent>
    </Card>
  );
}
