
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
    <div className="space-y-6">
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

       {!isProUser && (
        <Card className="border-primary/50 bg-primary/10">
          <CardHeader>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Función Exclusiva del Plan Pro</CardTitle>
                    <CardDescription className="text-primary/90">
                        Las automatizaciones te permiten conectar tus apps y ahorrar cientos de horas.
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-primary/80">
                Actualiza al plan Pro para crear flujos de trabajo ilimitados y conectar todas las aplicaciones disponibles.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
      
       <Card className={cn(!isProUser && "opacity-50 pointer-events-none")}>
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
                          disabled={!isProUser}
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
                          <Button variant="ghost" className="h-8 w-8 p-0" disabled={!isProUser}>
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
  );
}
