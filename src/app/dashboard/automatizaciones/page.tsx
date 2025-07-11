
'use client';

import { useState, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Power, PowerOff, Trash2, Pencil, Play, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type AutomationStatus = 'Activo' | 'Inactivo';

type Automation = {
  id: string;
  name: string;
  description: string;
  status: AutomationStatus;
  lastRun: string;
  trigger: string;
};

const initialAutomations: Automation[] = [
  {
    id: '1',
    name: 'Guardar facturas de Gmail en Google Drive',
    description: 'Cuando llega un nuevo correo con una factura, la guarda en una carpeta específica de Drive.',
    status: 'Activo',
    lastRun: 'Hace 2 horas',
    trigger: 'Nuevo Email en Gmail',
  },
  {
    id: '2',
    name: 'Publicar nuevo post del blog en redes sociales',
    description: 'Publica automáticamente en Twitter y LinkedIn cada vez que se añade una nueva entrada al blog.',
    status: 'Activo',
    lastRun: 'Ayer',
    trigger: 'Nuevo Post de Blog',
  },
  {
    id: '3',
    name: 'Recordatorio de pago de facturas',
    description: 'Envía un recordatorio por email a los clientes 3 días antes del vencimiento de una factura.',
    status: 'Inactivo',
    lastRun: 'Nunca',
    trigger: 'Vencimiento de Factura',
  },
  {
    id: '4',
    name: 'Sincronizar contactos con Mailchimp',
    description: 'Añade nuevos clientes a una lista de Mailchimp para campañas de email marketing.',
    status: 'Activo',
    lastRun: 'Hace 5 minutos',
    trigger: 'Nuevo Cliente Creado',
  },
];

const getStatusBadgeClass = (status: AutomationStatus) => {
  switch (status) {
    case 'Activo':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Inactivo':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

function ProFeatureLock() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
      <Card className="max-w-md text-center">
        <CardContent className="p-8">
          <Lock className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-2xl font-semibold">Función Exclusiva del Plan Pro</h3>
          <p className="mt-2 text-muted-foreground">
            Mejora tu plan para crear y gestionar automatizaciones ilimitadas.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function AutomatizacionesPage() {
  const [automations, setAutomations] = useState<Automation[]>(initialAutomations);
  const { toast } = useToast();
  const { user } = useContext(AuthContext);

  const isProUser = user?.role === 'pro' || user?.role === 'admin';

  const handleStatusChange = (id: string, newStatus: boolean) => {
    setAutomations(
      automations.map((aut) =>
        aut.id === id ? { ...aut, status: newStatus ? 'Activo' : 'Inactivo' } : aut
      )
    );
  };
  
  const handleComingSoon = () => {
    toast({
      title: 'Función en desarrollo',
      description: 'Esta acción estará disponible pronto.',
    });
  };

  return (
    <div className="relative">
      {!isProUser && <ProFeatureLock />}
      <div className={cn("space-y-6", !isProUser && "opacity-50 pointer-events-none")}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Automatizaciones</h1>
            <p className="text-muted-foreground">
              Crea flujos de trabajo personalizados para automatizar tareas repetitivas y conectar tus aplicaciones.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/automatizaciones/crear">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nueva Automatización
            </Link>
          </Button>
        </div>
        
         <Card>
          <CardHeader>
            <CardTitle>Mis Flujos de Trabajo</CardTitle>
            <CardDescription>Gestiona tus automatizaciones activas e inactivas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Estado</TableHead>
                  <TableHead>Nombre del Flujo</TableHead>
                  <TableHead>Disparador</TableHead>
                  <TableHead>Última Ejecución</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {automations.map((automation) => (
                  <TableRow key={automation.id}>
                    <TableCell>
                       <div className="flex flex-col items-center gap-2">
                          <Switch
                            checked={automation.status === 'Activo'}
                            onCheckedChange={(checked) => handleStatusChange(automation.id, checked)}
                            aria-label={`Activar o desactivar la automatización ${automation.name}`}
                          />
                          <Badge variant="outline" className={cn("text-xs", getStatusBadgeClass(automation.status))}>
                             {automation.status}
                          </Badge>
                       </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{automation.name}</p>
                      <p className="text-sm text-muted-foreground">{automation.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{automation.trigger}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{automation.lastRun}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                             <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                             <DropdownMenuItem onClick={handleComingSoon}>
                               <Pencil className="mr-2 h-4 w-4" />
                              <span>Editar Flujo</span>
                             </DropdownMenuItem>
                              <DropdownMenuItem onClick={handleComingSoon}>
                               <Play className="mr-2 h-4 w-4" />
                               <span>Ejecutar ahora</span>
                             </DropdownMenuItem>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => alert('Simulación: Eliminar flujo')}>
                               <Trash2 className="mr-2 h-4 w-4" />
                               <span>Eliminar</span>
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
