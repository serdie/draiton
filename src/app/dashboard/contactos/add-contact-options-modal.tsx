
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserPlus, Mail, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { GoogleAuthProvider, linkWithPopup } from 'firebase/auth';
import { useContext, useState } from 'react';
import { AuthContext } from '@/context/auth-context';

interface AddContactOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddManual: () => void;
}

const GoogleIcon = () => (
    <svg className="h-6 w-6" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path fill="#4285F4" d="M21.35 11.1h-9.1v2.7h5.1c-.2 1.1-.9 2.1-1.9 2.8v1.9c1.9-1 3.2-3.1 3.2-5.4 0-.6-.1-1.1-.2-1.7z"/><path fill="#34A853" d="M12.25 22c2.7 0 4.9-1 6.5-2.7l-2.2-1.9c-.8.6-1.9.9-3.2.9-2.5 0-4.6-1.7-5.4-4H4.25v2c1.4 2.7 4.1 4.5 7.1 4.5z"/><path fill="#FBBC05" d="M6.85 14.1c-.2-.6-.2-1.2-.2-1.8s0-1.2.2-1.8V8.5h-2.6c-.6 1.2-1 2.6-1 4.2s.4 3 1 4.2l2.6-2z"/><path fill="#EA4335" d="M12.25 6.1c1.4 0 2.5.5 3.4 1.4l1.9-1.9C16.15 3.8 14.35 3 12.25 3 9.25 3 6.55 4.8 5.15 7.5l2.6 2c.8-2.3 2.9-4 5.4-4z"/></svg>
);

const OutlookIcon = () => (
    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.2 7.8l-7.4 7.4c-.8.8-2 .8-2.8 0L2.2 7.8" stroke="#0078D4"/>
        <path d="M14.6 17.8H22v-7.6L14.6 17.8z" fill="#0078D4"/>
    </svg>
)

export function AddContactOptionsModal({ isOpen, onClose, onAddManual }: AddContactOptionsModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleComingSoon = () => {
    toast({
      title: 'Función en desarrollo',
      description: 'La importación de contactos estará disponible próximamente.',
    });
  };

  const handleImportFromGoogle = async () => {
    if (!auth.currentUser) return;
    
    const isGoogleLinked = user?.providerData?.some(p => p.providerId === 'google.com');

    if (isGoogleLinked) {
        toast({ title: 'Ya conectado', description: 'Tu cuenta de Google ya está vinculada. La importación se habilitará pronto.'});
        router.push('/dashboard/conexiones');
        return;
    }

    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    try {
        await linkWithPopup(auth.currentUser, provider);
        toast({
            title: `¡Conexión con Google establecida!`,
            description: 'Ahora puedes sincronizar tus contactos.',
        });
        onClose();
        router.push('/dashboard/conexiones');
    } catch (error: any) {
        if (error.code === 'auth/credential-already-in-use') {
             toast({
                variant: 'destructive',
                title: 'Cuenta ya en uso',
                description: 'Esta cuenta de Google ya está vinculada a otro usuario de la plataforma.',
            });
        } else if(error.code === 'auth/popup-closed-by-user') {
            toast({
                variant: 'destructive',
                title: 'Conexión cancelada',
                description: 'Has cerrado la ventana de conexión de Google.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error de Conexión',
                description: 'No se pudo vincular la cuenta. Inténtalo de nuevo.',
            });
        }
        console.error("Error linking Google account:", error);
    } finally {
        setIsGoogleLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Contacto</DialogTitle>
          <DialogDescription>
            Elige un método para añadir un nuevo contacto a tu CRM.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <button onClick={onAddManual} className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors flex items-center gap-4">
            <UserPlus className="h-6 w-6 text-primary" />
            <div>
                <p className="font-semibold">Añadir Manualmente</p>
                <p className="text-sm text-muted-foreground">Introduce los datos de un nuevo contacto.</p>
            </div>
          </button>
           <button onClick={handleImportFromGoogle} className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors flex items-center gap-4" disabled={isGoogleLoading}>
            {isGoogleLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <GoogleIcon />}
            <div>
                <p className="font-semibold">Importar desde Google</p>
                <p className="text-sm text-muted-foreground">Conecta tu cuenta para sincronizar contactos.</p>
            </div>
          </button>
           <button onClick={handleComingSoon} className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors flex items-center gap-4">
            <OutlookIcon />
            <div>
                <p className="font-semibold">Importar desde Outlook</p>
                <p className="text-sm text-muted-foreground">Sincroniza tus contactos de Microsoft.</p>
            </div>
          </button>
           <button onClick={handleComingSoon} className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors flex items-center gap-4">
            <Upload className="h-6 w-6 text-primary" />
            <div>
                <p className="font-semibold">Subir un Archivo</p>
                <p className="text-sm text-muted-foreground">Importa desde un archivo CSV o Excel.</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
