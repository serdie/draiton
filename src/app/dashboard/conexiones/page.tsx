
'use client';

import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Trash2, Mail, Facebook, Linkedin, Instagram, CreditCard, MessageSquare, Server, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { GoogleIcon } from './google-icon';
import { AuthContext } from '@/context/auth-context';
import { auth } from '@/lib/firebase/config';
import { GoogleAuthProvider, FacebookAuthProvider, linkWithPopup, unlink } from "firebase/auth";
import { SmtpConnectionModal } from './smtp-connection-modal';


type Connection = {
  id: string;
  provider: string;
  name: string;
  status: string;
};

const allAvailableConnections = [
  { id: 'google.com', name: 'Google', description: 'Gmail, Drive, Calendar...', icon: <GoogleIcon /> },
  { id: 'facebook.com', name: 'Facebook', description: 'Facebook Pages, Messenger...', icon: <Facebook /> },
  { id: 'instagram.com', name: 'Instagram', description: 'Instagram for Business', icon: <Instagram /> },
  { id: 'linkedin.com', name: 'LinkedIn', description: 'Perfiles y páginas de empresa', icon: <Linkedin /> },
  { id: 'mailchimp.com', name: 'Mailchimp', description: 'Listas y campañas', icon: <Mail /> },
  { id: 'stripe.com', name: 'Stripe', description: 'Pagos y clientes', icon: <CreditCard /> },
  { id: 'whatsapp.com', name: 'WhatsApp', description: 'WhatsApp Business API', icon: <MessageSquare /> },
  { id: 'smtp', name: 'SMTP', description: 'Envío de correo personalizado', icon: <Server /> },
];

const getStatusBadgeClass = (status: string) => {
  if (status === 'Activa') return 'bg-green-100 text-green-800 border-green-200';
  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
};

const getProviderIcon = (provider: string) => {
    const conn = allAvailableConnections.find(c => c.name.toLowerCase() === provider.toLowerCase() || c.id === provider);
    return conn ? conn.icon : <Server />;
}

export default function ConexionesPage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);

  const connectedProviders = user?.providerData.map(p => p.providerId) || [];

  const availableConnections = allAvailableConnections.filter(
    conn => !connectedProviders.includes(conn.id)
  );

  const connectedAccounts = user?.providerData.map(p => {
    const providerInfo = allAvailableConnections.find(c => c.id === p.providerId);
    return {
        id: p.providerId,
        provider: providerInfo?.name || p.providerId,
        name: p.displayName || p.email || 'Cuenta Conectada',
        status: 'Activa'
    }
  }) || [];


  const handleConnect = async (providerId: string) => {
    if (!auth.currentUser) return;
    setConnectingProvider(providerId);

    let provider;
    if (providerId === 'google.com') {
        provider = new GoogleAuthProvider();
    } else if (providerId === 'facebook.com') {
        provider = new FacebookAuthProvider();
        provider.addScope('pages_show_list');
        provider.addScope('pages_manage_posts');
        provider.addScope('pages_read_engagement');
    } else if (providerId === 'smtp') {
        setIsSmtpModalOpen(true);
        setConnectingProvider(null);
        return;
    }
    else {
        toast({
            title: `Conexión con ${providerId} (Simulación)`,
            description: 'Esta conexión se habilitará en el futuro.',
        });
        setConnectingProvider(null);
        return;
    }

    try {
        await linkWithPopup(auth.currentUser, provider);
        toast({
            title: `¡Conexión con ${providerId.split('.')[0]} establecida!`,
            description: 'La nueva cuenta ha sido vinculada.',
        });
    } catch (error: any) {
        if (error.code === 'auth/credential-already-in-use') {
             toast({
                variant: 'destructive',
                title: 'Cuenta ya en uso',
                description: 'Esta cuenta ya está vinculada a otro usuario.',
            });
        } else if(error.code === 'auth/popup-closed-by-user') {
            toast({
                variant: 'destructive',
                title: 'Conexión cancelada',
                description: 'Has cerrado la ventana de conexión.',
            });
        }
        else {
            toast({
                variant: 'destructive',
                title: 'Error de Conexión',
                description: 'No se pudo vincular la cuenta. Inténtalo de nuevo.',
            });
        }
        console.error("Error linking account:", error);
    } finally {
        setConnectingProvider(null);
    }
  };
  
  const handleDeleteConfirmation = (providerId: string) => {
    setAccountToDelete(providerId);
  };

  const handleDelete = async () => {
    if (!accountToDelete || !auth.currentUser) return;

    if (auth.currentUser.providerData.length <= 1) {
        toast({
            variant: 'destructive',
            title: 'No se puede desvincular',
            description: 'No puedes eliminar tu único método de inicio de sesión.',
        });
        setAccountToDelete(null);
        return;
    }

    try {
        await unlink(auth.currentUser, accountToDelete);
        toast({
            title: 'Conexión Eliminada',
            description: `Se ha eliminado la conexión con ${accountToDelete.split('.')[0]}.`
        });
    } catch(error) {
        console.error("Error unlinking account:", error);
         toast({
            variant: 'destructive',
            title: 'Error al desvincular',
            description: 'No se pudo eliminar la conexión. Inténtalo de nuevo.',
        });
    } finally {
        setAccountToDelete(null);
    }
  }

  return (
    <>
    <SmtpConnectionModal isOpen={isSmtpModalOpen} onClose={() => setIsSmtpModalOpen(false)} />
    <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Desconectar {accountToDelete?.split('.')[0]}?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción eliminará la conexión. No podrás usarla en tus automatizaciones. Podrás volver a conectarla más tarde.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setAccountToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Sí, desconectar
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Conexiones y Credenciales</h1>
        <p className="text-muted-foreground">
          Conecta tus aplicaciones y servicios para usarlos en toda la plataforma, especialmente en las automatizaciones.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conexiones Disponibles</CardTitle>
          <CardDescription>Añade nuevas conexiones para potenciar tus flujos de trabajo.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableConnections.map((conn) => (
            <Card key={conn.name} className="flex flex-col items-center justify-center text-center p-4">
               <div className="mb-4 h-12 w-12 flex items-center justify-center bg-muted rounded-full text-primary">
                    {React.cloneElement(conn.icon, { className: "h-6 w-6" })}
               </div>
              <p className="font-semibold">{conn.name}</p>
              <p className="text-xs text-muted-foreground mb-4">{conn.description}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleConnect(conn.id || conn.name)}
                disabled={connectingProvider === (conn.id || conn.name)}
              >
                {connectingProvider === (conn.id || conn.name) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                {connectingProvider === (conn.id || conn.name) ? 'Conectando...' : 'Conectar'}
              </Button>
            </Card>
          ))}
           {availableConnections.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-4">¡Todas las aplicaciones disponibles ya están conectadas!</p>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cuentas Conectadas</CardTitle>
          <CardDescription>Gestiona tus conexiones existentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Icono</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Nombre de la Conexión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connectedAccounts.length > 0 ? connectedAccounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="text-muted-foreground">
                     {React.cloneElement(getProviderIcon(acc.id), { className: "h-5 w-5" })}
                  </TableCell>
                  <TableCell className="font-medium">{acc.provider}</TableCell>
                  <TableCell className="text-muted-foreground">{acc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeClass(acc.status)}>
                      {acc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirmation(acc.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No tienes ninguna cuenta conectada.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
