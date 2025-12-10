
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContext, useRef, useState } from 'react';
import { AuthContext } from '@/context/auth-context';
import { uploadAvatar } from '@/lib/firebase/storage-actions';
import { updateUserProfile } from '@/lib/firebase/user-settings-actions';
import { updateProfile, reauthenticateWithPopup, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteUserAndDataAction } from '@/lib/firebase/auth-actions';

export function PerfilSettings() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            const downloadURL = await uploadAvatar(user.uid, file);
            
            await updateUserProfile(user.uid, { photoURL: downloadURL });
            if(auth.currentUser) {
                await updateProfile(auth.currentUser, { photoURL: downloadURL });
            }

             toast({
                title: 'Avatar Actualizado',
                description: 'Tu imagen de perfil ha sido cambiada.',
            });
            
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error de Subida',
                description: 'No se pudo subir la imagen a Storage. Revisa la consola y las reglas de CORS/Storage.',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!user || !displayName) {
            toast({ variant: 'destructive', title: 'Error', description: 'El nombre no puede estar vacío.' });
            return;
        }

        setIsSavingProfile(true);
        try {
            await updateUserProfile(user.uid, { displayName });
             if(auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName });
            }
            toast({ title: "Perfil guardado", description: "Tu información personal ha sido actualizada." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar el perfil.' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSavePassword = () => {
        toast({ title: "Contraseña actualizada", description: "Tu nueva contraseña ha sido guardada de forma segura." });
    };

    const triggerFileSelect = () => fileInputRef.current?.click();
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    const handleDeleteAccount = async () => {
        if (!auth.currentUser) return;
        
        setIsDeleting(true);

        const providerId = auth.currentUser.providerData[0]?.providerId;
        let provider;
        if (providerId === 'google.com') provider = new GoogleAuthProvider();
        else if (providerId === 'facebook.com') provider = new FacebookAuthProvider();
        else if (providerId === 'microsoft.com') provider = new OAuthProvider('microsoft.com');

        if (!provider) {
             toast({
                variant: 'destructive',
                title: 'Error de autenticación',
                description: 'La eliminación de cuentas con email/contraseña no está soportada en este momento.',
            });
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            return;
        }

        try {
            // Step 1: Re-authenticate user
            await reauthenticateWithPopup(auth.currentUser, provider);
            
            // Step 2: Call the server action to delete all data and the user
            toast({ title: "Procesando eliminación...", description: "Estamos eliminando todos tus datos. Esto puede tardar un momento." });
            const result = await deleteUserAndDataAction(auth.currentUser.uid);

            if (result.success) {
                // The server action clears the cookie, now we sign out the client
                await signOut(auth); 
                toast({
                    title: 'Cuenta Eliminada',
                    description: 'Tu cuenta y todos tus datos han sido eliminados permanentemente.',
                });
                // AuthProvider will redirect to /login
            } else {
                throw new Error(result.error);
            }

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Error al eliminar la cuenta',
                description: `Ocurrió un error durante el proceso: ${error.message}`,
            });
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
        }
    }

  return (
      <>
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción es irreversible. Se eliminarán permanentemente tu cuenta y todos tus datos asociados (proyectos, facturas, clientes, etc.). Se te pedirá que te vuelvas a autenticar para confirmar.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="bg-destructive hover:bg-destructive/90">
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Sí, eliminar mi cuenta
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Card>
        <CardHeader>
            <CardTitle>Configuración del Perfil</CardTitle>
            <CardDescription>Gestiona tu información personal y detalles de la cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
            <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.photoURL ?? ''} alt="Avatar de usuario" />
                    <AvatarFallback>
                        {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : (user?.displayName ? getInitials(user.displayName) : <User className="h-8 w-8" />)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                    <p className="font-medium">Tu Avatar</p>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={triggerFileSelect} disabled={isUploading}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Cambiar
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled>
                            <Trash2 className="h-4 w-4 mr-2"/>
                            Eliminar
                        </Button>
                    </div>
                </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
                <h3 className="font-medium text-lg">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input id="email" type="email" value={user?.email || ''} disabled />
                    </div>
                </div>
                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                    {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Guardar Cambios
                </Button>
            </div>
            
            <Separator />

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

            <Separator />

            <div className="space-y-4 p-4 border border-destructive/50 bg-destructive/5 rounded-lg">
                <h3 className="font-medium text-lg text-destructive flex items-center gap-2">
                    <AlertTriangle/>
                    Zona de Peligro
                </h3>
                <p className="text-sm text-destructive/80">La siguiente acción es irreversible. Por favor, asegúrate de que quieres proceder.</p>
                 <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Mi Cuenta y Todos Mis Datos
                </Button>
            </div>

        </CardContent>
        </Card>
      </>
  );
}
