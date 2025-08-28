
'use client';

import React, { useState } from 'react';
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
import { MoreHorizontal, PlusCircle, Trash2, Mail, Facebook, Linkedin, Instagram, CreditCard, MessageSquare, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { GoogleIcon } from './google-icon';

type Connection = {
  id: string;
  provider: string;
  name: string;
  status: string;
};

const allAvailableConnections = [
  { name: 'Google', description: 'Gmail, Drive, Calendar...', icon: <GoogleIcon /> },
  { name: 'Facebook', description: 'Facebook Pages, Messenger...', icon: <Facebook /> },
  { name: 'Instagram', description: 'Instagram for Business', icon: <Instagram /> },
  { name: 'LinkedIn', description: 'Perfiles y páginas de empresa', icon: <Linkedin /> },
  { name: 'Mailchimp', description: 'Listas y campañas', icon: <Mail /> },
  { name: 'Stripe', description: 'Pagos y clientes', icon: <CreditCard /> },
  { name: 'WhatsApp', description: 'WhatsApp Business API', icon: <MessageSquare /> },
  { name: 'SMTP', description: 'Envío de correo personalizado', icon: <Server /> },
];

const initialConnectedAccounts: Connection[] = [
  { id: '1', provider: 'Google', name: 'miempresa@gmail.com', status: 'Activa' },
  { id: '2', provider: 'Stripe', name: 'Cuenta de Producción', status: 'Activa' },
];

const getStatusBadgeClass = (status: string) => {
  if (status === 'Activa') return 'bg-green-100 text-green-800 border-green-200';
  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
};

const getProviderIcon = (provider: string) => {
    const conn = allAvailableConnections.find(c => c.name.toLowerCase() === provider.toLowerCase());
    return conn ? conn.icon : <Server />;
}

export default function ConexionesPage() {
  const { toast } = useToast();
  const [connectedAccounts, setConnectedAccounts] = useState<Connection[]>(initialConnectedAccounts);
  const [accountToDelete, setAccountToDelete] = useState<Connection | null>(null);

  const availableConnections = allAvailableConnections.filter(
    conn => !connectedAccounts.some(acc => acc.provider === conn.name)
  );

  const handleConnect = (name: string, description: string) => {
    // Simulate connection
    toast({
      title: `Conectando con ${name}...`,
      description: 'Simulando el proceso de autorización.',
    });
    
    setTimeout(() => {
        const newConnection: Connection = {
            id: String(Date.now()),
            provider: name,
            name: description.split(',')[0], // Use a part of description as name
            status: 'Activa'
        };
        setConnectedAccounts(prev => [...prev, newConnection]);
        toast({
            title: `¡Conexión con ${name} establecida!`,
            description: 'La nueva cuenta aparece en tu lista de conexiones.',
        });
    }, 1500);
  };
  
  const handleDeleteConfirmation = (account: Connection) => {
    setAccountToDelete(account);
  };

  const handleDelete = () => {
    if (!accountToDelete) return;
    setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountToDelete.id));
    toast({
        title: 'Conexión Eliminada',
        description: `Se ha eliminado la conexión con ${accountToDelete.provider}.`
    });
    setAccountToDelete(null);
  }

  return (
    <>
    <AlertDialog open={!!accountToDelete} onOpenChange={(open) => !open && setAccountToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Desconectar {accountToDelete?.provider}?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción eliminará la conexión con <strong>{accountToDelete?.name}</strong>. No podrás usarla en tus automatizaciones. Podrás volver a conectarla más tarde.
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
              <Button variant="outline" size="sm" onClick={() => handleConnect(conn.name, conn.description)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Conectar
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
                     {React.cloneElement(getProviderIcon(acc.provider), { className: "h-5 w-5" })}
                  </TableCell>
                  <TableCell className="font-medium">{acc.provider}</TableCell>
                  <TableCell className="text-muted-foreground">{acc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeClass(acc.status)}>
                      {acc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirmation(acc)}>
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
