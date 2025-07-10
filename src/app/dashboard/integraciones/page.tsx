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
import { MoreHorizontal, PlusCircle, Trash2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const availableConnections = [
  { name: 'Google', description: 'Gmail, Drive, Calendar...', logo: '/logos/google.svg' },
  { name: 'Facebook', description: 'Facebook Pages, Messenger...', logo: '/logos/facebook.svg' },
  { name: 'Instagram', description: 'Instagram for Business', logo: '/logos/instagram.svg' },
  { name: 'LinkedIn', description: 'Perfiles y páginas de empresa', logo: '/logos/linkedin.svg' },
  { name: 'Mailchimp', description: 'Listas y campañas', logo: '/logos/mailchimp.svg' },
  { name: 'Stripe', description: 'Pagos y clientes', logo: '/logos/stripe.svg' },
  { name: 'WhatsApp', description: 'WhatsApp Business API', logo: '/logos/whatsapp.svg' },
  { name: 'SMTP', description: 'Envío de correo personalizado', logo: '/logos/smtp.svg' },
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

const getProviderLogo = (provider: string) => {
    const conn = availableConnections.find(c => c.name.toLowerCase() === provider.toLowerCase());
    return conn ? conn.logo : '/logos/default.svg';
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
              <Image data-ai-hint={`${conn.name} logo`} src={conn.logo} alt={`${conn.name} Logo`} width={48} height={48} className="mb-4" />
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
                <TableHead className="w-[50px]">Logo</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Nombre de la Conexión</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connectedAccounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell>
                     <Image data-ai-hint={`${acc.provider} logo`} src={getProviderLogo(acc.provider)} alt={`${acc.provider} logo`} width={24} height={24} />
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
