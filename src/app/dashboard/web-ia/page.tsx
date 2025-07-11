
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { GestorWebForm } from '../gestor-web-ia/gestor-web-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Eye, Lock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getWebsiteConceptAction } from './actions';

type SiteStatus = 'Publicado' | 'En Edición' | 'Borrador';

const generatedSites = [
  {
    id: '1',
    name: 'Cafetería El Sol Naciente',
    type: 'Landing Page',
    lastUpdated: '2024-05-10',
    status: 'Publicado' as SiteStatus,
    url: 'https://cafeteria-sol-naciente.example.com',
    image: 'https://placehold.co/600x400.png',
    imageHint: 'cafe interior'
  },
  {
    id: '2',
    name: 'Artesanías Luna Creativa',
    type: 'Tienda Online',
    lastUpdated: '2024-05-15',
    status: 'En Edición' as SiteStatus,
    url: null,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'creative crafts'
  },
  {
    id: '3',
    name: 'Consultoría Tech Global',
    type: 'Sitio Informativo',
    lastUpdated: '2024-05-01',
    status: 'Borrador' as SiteStatus,
    url: null,
    image: 'https://placehold.co/600x400.png',
    imageHint: 'modern office'
  },
];

const getStatusBadgeClass = (status: SiteStatus) => {
  switch (status) {
    case 'Publicado': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'En Edición': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Borrador': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

export default function WebIAPage() {
  const { user } = useContext(AuthContext);
  const isProUser = user?.role === 'pro' || user?.role === 'admin';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tu Asistente Web Inteligente</h1>
          <p className="text-muted-foreground">
            Crea y administra tu presencia online: sitios web, tiendas online y landing pages con el poder de la IA.
          </p>
        </div>
        <Button variant="outline" disabled>
          <Eye className="mr-2 h-4 w-4" />
          Ver Plantillas IA (Próximamente)
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
                      Crea y administra tu presencia online con el poder de la inteligencia artificial.
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-primary/80">
              Actualiza al plan Pro para crear sitios web, tiendas online y landing pages ilimitadas con nuestro asistente inteligente.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <Tabs defaultValue="gestionar" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="crear">Crear Nuevo Sitio</TabsTrigger>
            <TabsTrigger value="gestionar">Gestionar Sitios Existentes</TabsTrigger>
        </TabsList>
        <TabsContent value="crear">
          <Card className={cn(!isProUser && "opacity-50 pointer-events-none")}>
            <CardHeader>
              <CardTitle>Crear un nuevo sitio web</CardTitle>
              <CardDescription>Proporciona los detalles para que la IA pueda generar un concepto a tu medida.</CardDescription>
            </CardHeader>
            <CardContent>
              <GestorWebForm action={getWebsiteConceptAction} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gestionar">
           <div className={cn("space-y-6", !isProUser && "opacity-50 pointer-events-none")}>
                <h2 className="text-2xl font-semibold tracking-tight">Mis Sitios Web Generados</h2>
                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {generatedSites.map(site => (
                         <Card key={site.id} className="flex flex-col">
                            <CardHeader className="p-0">
                                <Image 
                                    src={site.image}
                                    alt={`Vista previa de ${site.name}`}
                                    width={600}
                                    height={400}
                                    data-ai-hint={site.imageHint}
                                    className="rounded-t-lg object-cover"
                                />
                            </CardHeader>
                            <CardContent className="flex-grow p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{site.name}</CardTitle>
                                        <CardDescription>{site.type}</CardDescription>
                                    </div>
                                    <Badge variant="outline" className={cn('font-semibold', getStatusBadgeClass(site.status))}>{site.status}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground pt-2">
                                    <p>Última act.: {new Date(site.lastUpdated).toLocaleDateString('es-ES')}</p>
                                    {site.url && (
                                        <Link href={site.url} target="_blank" className="text-primary hover:underline truncate block">
                                            {site.url}
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 border-t flex justify-between items-center">
                                <Button variant="outline" size="sm" disabled={!isProUser}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar con IA
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!isProUser}>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Ver Sitio</DropdownMenuItem>
                                        <DropdownMenuItem>Configuración</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">Eliminar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
