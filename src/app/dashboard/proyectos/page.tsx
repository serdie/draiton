'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, List, LayoutGrid, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateProjectModal } from './create-project-modal';

type ProjectStatus = 'En Progreso' | 'Planificación' | 'Completado' | 'En Espera' | 'Cancelado';

export type Project = {
  id: string;
  name: string;
  client: string;
  startDate: string;
  estimatedEndDate: string;
  budget: number | null;
  status: ProjectStatus;
};

const projectsData: Project[] = [
  { id: '1', name: 'Desarrollo Web para \'Café Delicia\'', client: 'Café Delicia S.L.', startDate: '2023-10-01', estimatedEndDate: '2023-12-15', budget: 2500, status: 'En Progreso' },
  { id: '2', name: 'Campaña Marketing Digital Q4', client: 'Moda Urbana Ltda.', startDate: '2023-09-15', estimatedEndDate: '2023-12-31', budget: 1800, status: 'Planificación' },
  { id: '3', name: 'Consultoría SEO para \'TecnoSoluciones\'', client: 'TecnoSoluciones Avanzadas', startDate: '2023-08-01', estimatedEndDate: '2023-10-30', budget: 1200, status: 'Completado' },
  { id: '4', name: 'Diseño de Logo y Branding para \'EcoVida\'', client: 'EcoVida Productos Naturales', startDate: '2023-11-01', estimatedEndDate: 'N/A', budget: null, status: 'En Espera' },
  { id: '5', name: 'Migración de Servidores', client: 'Global Tech Inc.', startDate: '2023-07-20', estimatedEndDate: '2023-08-30', budget: 5000, status: 'Completado' },
  { id: '6', name: 'App Móvil para Eventos', client: 'Eventos Plus', startDate: '2024-01-10', estimatedEndDate: '2024-06-30', budget: 12000, status: 'En Progreso' },
  { id: '7', name: 'Estrategia de Contenidos 2024', client: 'Moda Urbana Ltda.', startDate: '2023-11-15', estimatedEndDate: '2023-12-20', budget: 950, status: 'Planificación' },
  { id: '8', name: 'Optimización de Base de Datos', client: 'TecnoSoluciones Avanzadas', startDate: '2023-09-05', estimatedEndDate: '2023-09-25', budget: 750, status: 'Cancelado' },
];

const getStatusBadgeClass = (status: ProjectStatus) => {
  switch (status) {
    case 'En Progreso': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Planificación': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Completado': return 'bg-green-100 text-green-800 border-green-200';
    case 'En Espera': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

const projectStatuses: ProjectStatus[] = ['En Progreso', 'Planificación', 'Completado', 'En Espera', 'Cancelado'];

export default function ProyectosPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<ProjectStatus | 'all'>('all');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredProjects = useMemo(() => {
        return projectsData.filter(project => {
            const porTexto = !filtroTexto || 
                project.name.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                project.client.toLowerCase().includes(filtroTexto.toLowerCase());

            const porEstado = filtroEstado === 'all' || project.status === filtroEstado;
            
            return porTexto && porEstado;
        });
    }, [filtroTexto, filtroEstado]);

    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

    const paginatedProjects = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProjects.slice(startIndex, endIndex);
    }, [filteredProjects, currentPage, itemsPerPage]);

    const resetFilters = () => {
        setFiltroTexto('');
        setFiltroEstado('all');
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

  return (
    <>
    <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Proyectos</h1>
          <p className="text-muted-foreground">
            Organiza y haz seguimiento del progreso de todos tus proyectos.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Nuevo Proyecto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:max-w-xl">
              <Input 
                placeholder="Buscar por proyecto o cliente..."
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
              <Select value={filtroEstado} onValueChange={(value) => setFiltroEstado(value as any)}>
                <SelectTrigger><SelectValue placeholder="Filtrar por estado" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {projectStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters}><FilterX className="mr-2 h-4 w-4" />Limpiar</Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="listado" className="w-full">
        <TabsList>
          <TabsTrigger value="listado"><List className="mr-2 h-4 w-4" />Listado</TabsTrigger>
          <TabsTrigger value="kanban" disabled><LayoutGrid className="mr-2 h-4 w-4" />Kanban (Próximamente)</TabsTrigger>
        </TabsList>

        <TabsContent value="listado">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre del Proyecto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin Estimada</TableHead>
                    <TableHead className="text-right">Presupuesto</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedProjects.length > 0 ? (
                        paginatedProjects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell className="font-medium">{project.name}</TableCell>
                                <TableCell className="text-muted-foreground">{project.client}</TableCell>
                                <TableCell className="text-muted-foreground">{format(new Date(project.startDate), "dd MMM yyyy", { locale: es })}</TableCell>
                                <TableCell className="text-muted-foreground">{project.estimatedEndDate !== 'N/A' ? format(new Date(project.estimatedEndDate), "dd MMM yyyy", { locale: es }) : 'N/A'}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{project.budget ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(project.budget) : 'N/A'}</TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={cn('font-semibold', getStatusBadgeClass(project.status))}>
                                        {project.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menú</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">Eliminar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No se encontraron proyectos con los filtros aplicados.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
              </Table>
            </CardContent>
             <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Resultados por página:</span>
                    <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-20 h-8">
                        <SelectValue placeholder={itemsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <span>Página {currentPage} de {totalPages > 0 ? totalPages : 1}</span>
                    <div className="flex items-center gap-2">
                    <Button
                        variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline" size="icon" className="h-8 w-8"
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    </div>
                </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="kanban">
            <Card>
                <CardHeader>
                    <CardTitle>Vista Kanban</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Esta vista estará disponible próximamente para que gestiones tus proyectos arrastrando tarjetas.</p>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
