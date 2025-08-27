
'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Pencil, BarChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type CampaignStatus = 'Borrador' | 'Enviado';

type Campaign = {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  sentDate: string;
  recipients: number;
  openRate: string;
};

const initialCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Lanzamiento Q3',
    subject: '¡Nuevas funciones para potenciar tu negocio!',
    status: 'Enviado',
    sentDate: '15 Jul, 2024',
    recipients: 1250,
    openRate: '25.4%',
  },
  {
    id: '2',
    name: 'Promoción de Verano',
    subject: '☀️ Descuento del 20% solo este mes',
    status: 'Borrador',
    sentDate: '-',
    recipients: 0,
    openRate: '-',
  },
];

const getStatusBadgeClass = (status: CampaignStatus) => {
  switch (status) {
    case 'Enviado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Borrador':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};


export default function MarketingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const { toast } = useToast();

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
          <h1 className="text-3xl font-bold">Campañas de Email</h1>
          <p className="text-muted-foreground">
            Crea, gestiona y analiza el rendimiento de tus campañas de marketing por correo.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/marketing/campanas/crear">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Nueva Campaña
          </Link>
        </Button>
      </div>
      
       <Card>
        <CardHeader>
          <CardTitle>Mis Campañas</CardTitle>
          <CardDescription>Lista de todas tus campañas de correo electrónico.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Campaña</TableHead>
                <TableHead className="hidden md:table-cell">Asunto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Destinatarios</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Tasa Apertura</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">{campaign.subject}</TableCell>
                   <TableCell>
                      <Badge variant="outline" className={cn("text-xs", getStatusBadgeClass(campaign.status))}>
                         {campaign.status}
                      </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right">{campaign.recipients.toLocaleString('es-ES')}</TableCell>
                  <TableCell className="hidden lg:table-cell text-right">{campaign.openRate}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={handleComingSoon}>
                             <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                           </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleComingSoon}>
                             <BarChart className="mr-2 h-4 w-4" />
                             <span>Ver estadísticas</span>
                           </DropdownMenuItem>
                           <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleComingSoon}>
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
