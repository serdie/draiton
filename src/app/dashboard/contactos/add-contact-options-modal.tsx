
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
import { GoogleAuthProvider, OAuthProvider, linkWithPopup, reauthenticateWithPopup } from 'firebase/auth';
import { useContext, useState } from 'react';
import { AuthContext } from '@/context/auth-context';
import { ImportGoogleContactsModal } from './import-google-contacts-modal';
import { ImportOutlookContactsModal } from './import-outlook-contacts-modal';
import { GoogleIcon } from '../conexiones/google-icon';
import { OutlookIcon } from './outlook-icon';

interface AddContactOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddManual: () => void;
}

export function AddContactOptionsModal({ isOpen, onClose, onAddManual }: AddContactOptionsModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<null | 'google' | 'outlook'>(null);
  const [isGoogleImportModalOpen, setIsGoogleImportModalOpen] = useState(false);
  const [isOutlookImportModalOpen, setIsOutlookImportModalOpen] = useState(false);


  const handleComingSoon = () => {
    toast({
      title: 'Función en desarrollo',
      description: 'La importación de contactos desde un archivo estará disponible próximamente.',
    });
  };

  const handleImportFromGoogle = async () => {
    if (!auth.currentUser) return;
    
    setIsLoading('google');
    
    try {
        const isGoogleLinked = user?.providerData?.some(p => p.providerId === 'google.com');

        if (!isGoogleLinked) {
            const googleProvider = new GoogleAuthProvider();
            googleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
            await linkWithPopup(auth.currentUser, googleProvider);
            toast({
                title: `¡Conexión con Google establecida!`,
                description: 'Ahora puedes sincronizar tus contactos.',
            });
        }
        
        setIsGoogleImportModalOpen(true);
        onClose();

    } catch (error: any) {
        if (error.code === 'auth/credential-already-in-use') {
             toast({
                variant: 'destructive',
                title: 'Cuenta ya en uso',
                description: 'Esta cuenta de Google ya está vinculada a otro usuario de la plataforma.',
            });
        } else if(error.code === 'auth/popup-closed-by-user') {
            // Do not show an error if user simply closes the window
        } else {
            toast({
                variant: 'destructive',
                title: 'Error de Conexión',
                description: 'No se pudo vincular la cuenta. Inténtalo de nuevo.',
            });
        }
        console.error("Error linking Google account:", error);
    } finally {
        setIsLoading(null);
    }
  };
  
   const handleImportFromOutlook = async () => {
    if (!auth.currentUser) return;
    setIsLoading('outlook');
    try {
      const isMicrosoftLinked = user?.providerData?.some(p => p.providerId === 'microsoft.com');
      if (!isMicrosoftLinked) {
        const microsoftProvider = new OAuthProvider('microsoft.com');
        microsoftProvider.addScope('Contacts.Read');
        await linkWithPopup(auth.currentUser, microsoftProvider);
        toast({
            title: `¡Conexión con Microsoft establecida!`,
            description: 'Ahora puedes sincronizar tus contactos.',
        });
      }
      setIsOutlookImportModalOpen(true);
      onClose();
    } catch (error: any) {
       if (error.code === 'auth/credential-already-in-use') {
            toast({ variant: 'destructive', title: 'Cuenta ya en uso', description: 'Esta cuenta de Microsoft ya está vinculada a otro usuario.' });
        } else if(error.code === 'auth/popup-closed-by-user') {
            // No-op
        } else {
            toast({ variant: 'destructive', title: 'Error de Conexión', description: 'No se pudo vincular la cuenta de Microsoft.' });
        }
        console.error("Error linking Microsoft account:", error);
    } finally {
      setIsLoading(null);
    }
  };


  return (
    <>
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
           <button onClick={handleImportFromGoogle} className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors flex items-center gap-4" disabled={isLoading !== null}>
            {isLoading === 'google' ? <Loader2 className="h-6 w-6 animate-spin" /> : <GoogleIcon className="h-6 w-6" />}
            <div>
                <p className="font-semibold">Importar desde Google</p>
                <p className="text-sm text-muted-foreground">Conecta tu cuenta para sincronizar contactos.</p>
            </div>
          </button>
           <button onClick={handleImportFromOutlook} className="w-full text-left p-4 rounded-lg border hover:bg-muted transition-colors flex items-center gap-4" disabled={isLoading !== null}>
            {isLoading === 'outlook' ? <Loader2 className="h-6 w-6 animate-spin" /> : <OutlookIcon className="h-6 w-6" />}
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
    
    <ImportGoogleContactsModal 
        isOpen={isGoogleImportModalOpen}
        onClose={() => setIsGoogleImportModalOpen(false)}
    />
     <ImportOutlookContactsModal 
        isOpen={isOutlookImportModalOpen}
        onClose={() => setIsOutlookImportModalOpen(false)}
    />
    </>
  );
}
