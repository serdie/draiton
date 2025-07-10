'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { MoreHorizontal, PlusCircle, Trash2, Mail, Facebook, Linkedin, Bot, Stripe, MessageSquare, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React from 'react';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.5 16.5c-1.5-1.5-2-4-1-6 1-2 3-3 5-2 2 1 3 3 2 5-1 2-3.5 2.5-6.5 3" />
    <path d="M12 14c-1.5-1.5-1.5-3.5 0-5 1.5-1.5 3.5-1.5 5 0" />
    <path d="M8.5 11.5c-1-1-1-2.5 0-3.5 1-1 2.5-1 3.5 0" />
    <path d="M14 12c-1.5-1.5-2-4-1-6 1-2 3-3 5-2 2 1 3 3 2 5-1 2-3.5 2.5-6.5 3" />
    <path d="M18 10c-1-1-1-2.5 0-3.5 1-1 2.5-1 3.5 0" />
  </svg>
);

const availableConnections = [
  { name: 'Google', description: 'Gmail, Drive, Calendar...', icon: <GoogleIcon /> },
  { name: 'Facebook', description: 'Facebook Pages, Messenger...', icon: <Facebook /> },
  { name: 'Instagram', description: 'Instagram for Business', icon: <Bot /> }, // Placeholder for Instagram
  { name: 'LinkedIn', description: 'Perfiles y páginas de empresa', icon: <Linkedin /> },
  { name: 'Mailchimp', description: 'Listas y campañas', icon: <Mail /> },
  { name: 'Stripe', description: 'Pagos y clientes', icon: <Stripe /> },
  { name: 'WhatsApp', description: 'WhatsApp Business API', icon: <MessageSquare /> },
  { name: 'SMTP', description: 'Envío de correo personalizado', icon: <Server /> },
];

const connectedAccounts = [
  { id: '1', provider: 'Google', name: 'miempresa@gmail.com', status: 'Activa' },
  { id: '2', provider: 'Facebook', name: 'Página "Mi Gran Empresa"', status: 'Activa' },
  { id: '3', provider: 'Stripe', name: 'Cuenta de Producción', status: 'Requiere atención' },
];

const getStatusBadgeClass = (status: string) => {
  if (status === 'Activa') return 'bg-green-100 text-green-800 border-green-200';
  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
};

const getProviderIcon = (provider: string) => {
    const conn = availableConnections.find(c => c.name.toLowerCase() === provider.toLowerCase());
    return conn ? conn.icon : <Server />;
}

export default function IntegracionesPage() {
  const { toast } = useToast();

  const handleConnect = (name: string) => {
    toast({
      title: `Conectando con ${name}`,
      description: 'Esta función estará disponible próximamente.',
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Integraciones y Conexiones</h1>
        <p className="text-muted-foreground">
          Conecta tus aplicaciones y servicios para usarlos en toda la plataforma.
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
              <Button variant="outline" size="sm" onClick={() => handleConnect(conn.name)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Conectar
              </Button>
            </Card>
          ))}
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
              {connectedAccounts.map((acc) => (
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
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
