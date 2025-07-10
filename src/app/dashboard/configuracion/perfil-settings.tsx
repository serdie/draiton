
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PerfilSettings() {
    const { toast } = useToast();

    const handleSaveProfile = () => {
        toast({ title: "Perfil guardado", description: "Tu información personal ha sido actualizada." });
    };

    const handleSavePassword = () => {
        toast({ title: "Contraseña actualizada", description: "Tu nueva contraseña ha sido guardada de forma segura." });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración del Perfil</CardTitle>
        <CardDescription>Gestiona tu información personal y detalles de la cuenta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
                <AvatarImage src="https://placehold.co/80x80.png" alt="Avatar de usuario" />
                <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
                <p className="font-medium">Tu Avatar</p>
                <div className="flex gap-2">
                    <Button size="sm">Cambiar</Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2"/>
                        Eliminar
                    </Button>
                </div>
            </div>
        </div>
        
        <Separator />
        
        {/* Personal Info Section */}
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Información Personal</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input id="name" defaultValue="Usuario de Ejemplo" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" defaultValue="usuario@email.com" />
                </div>
            </div>
             <Button onClick={handleSaveProfile}>Guardar Cambios</Button>
        </div>
        
        <Separator />

        {/* Password Section */}
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Cambiar Contraseña</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Contraseña Actual</Label>
                    <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <Input id="new-password" type="password" />
                </div>
            </div>
             <Button onClick={handleSavePassword}>Actualizar Contraseña</Button>
        </div>

      </CardContent>
    </Card>
  );
}
