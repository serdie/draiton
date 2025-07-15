
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, List, LayoutGrid, FilterX, ChevronLeft, ChevronRight, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateProjectModal } from './create-project-modal';
import { EditProjectModal } from './edit-project-modal';
import { AuthContext } from '@/context/auth-context';
import { collection, onSnapshot, query, where, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export type ProjectStatus = 'En Progreso' | 'Planificación' | 'Completado' | 'En Espera' | 'Cancelado';

export type Project = {
  id: string;
  ownerId: string;
  name: string;
  client: string;
  description?: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: number | null;
  status: ProjectStatus;
  createdAt: Date;
};


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
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<ProjectStatus | 'all'>('all');
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        if (!db || !user) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const q = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docsList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : null,
                    endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : null,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
                } as Project;
            });
            setProjects(docsList.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los proyectos.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            const porTexto = !filtroTexto || 
                project.name.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                project.client.toLowerCase().includes(filtroTexto.toLowerCase());

            const porEstado = filtroEstado === 'all' || project.status === filtroEstado;
            
            return porTexto && porEstado;
        });
    }, [projects, filtroTexto, filtroEstado]);

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

    const handleDelete = async () => {
        if (!projectToDelete) return;
        
        try {
            await deleteDoc(doc(db, "projects", projectToDelete.id));
            toast({
                title: 'Proyecto Eliminado',
                description: `El proyecto ${projectToDelete.name} ha sido eliminado.`,
            });
        } catch (error) {
            console.error("Error al eliminar el proyecto:", error);
            toast({
                variant: 'destructive',
                title: 'Error al eliminar',
                description: 'No se pudo eliminar el proyecto. Revisa la consola y los permisos.',
            });
        } finally {
            setProjectToDelete(null);
        }
    };
    
    const renderContent = () => {
        if (loading) {
            return (
                 <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )
        }
        return (
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
                                <TableCell className="text-muted-foreground">{project.startDate ? format(project.startDate, "dd MMM yyyy", { locale: es }) : 'N/A'}</TableCell>
                                <TableCell className="text-muted-foreground">{project.endDate ? format(project.endDate, "dd MMM yyyy", { locale: es }) : 'N/A'}</TableCell>
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
                                            <DropdownMenuItem onClick={() => setProjectToEdit(project)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setProjectToDelete(project)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                                No tienes proyectos. ¡Crea uno nuevo para empezar!
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
              </Table>
        )
    }

  return (
    <>
    <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    {projectToEdit && (
        <EditProjectModal
            isOpen={!!projectToEdit}
            onClose={() => setProjectToEdit(null)}
            project={projectToEdit}
        />
    )}
    <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. El proyecto <strong>{projectToDelete?.name}</strong> será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              {renderContent()}
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

    