

'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Loader2, User, HardHat, FileText, BarChart2 } from 'lucide-react';
import { CreateProjectModal } from './create-project-modal';
import { AuthContext } from '@/context/auth-context';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import ContactosPage from '../contactos/page';
import TareasPage from '../tareas/page';
import InformesPage from '../informes/page';

export type ProjectStatus = 'Planificación' | 'En Progreso' | 'En Espera' | 'Completado' | 'Cancelado';

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
  progress?: number;
  createdAt: Date;
};

export const projectStatuses: ProjectStatus[] = ['Planificación', 'En Progreso', 'En Espera', 'Completado', 'Cancelado'];

export default function OperacionesPage() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
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
            toast({ variant: 'destructive', title: 'Error de Permisos', description: 'No se pudieron cargar los proyectos. Revisa tus reglas de seguridad de Firestore.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    const activeProjects = useMemo(() => {
        return projects.filter(p => p.status === 'En Progreso' || p.status === 'Planificación');
    }, [projects]);
    
    const getInitials = (name: string) => {
      if (!name) return 'U';
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    const renderProjectsContent = () => {
        if (loading) {
            return (
                 <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            )
        }
        if (activeProjects.length === 0) {
            return (
                <div className="text-center text-muted-foreground py-12">
                    No tienes proyectos activos. ¡Crea uno para empezar!
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProjects.map(project => {
                    const progress = project.progress || 0;

                    return (
                        <Link href={`/dashboard/proyectos/${project.id}`} key={project.id}>
                            <Card className="hover:border-primary transition-colors h-full flex flex-col">
                                <CardHeader>
                                    <CardTitle>{project.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                         <div className="flex -space-x-2">
                                            <Avatar className="w-8 h-8 border-2 border-background">
                                                <AvatarImage src={user?.photoURL || ''} />
                                                <AvatarFallback>{getInitials(user?.displayName || '')}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <span className="text-sm font-semibold text-primary">{project.budget ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(project.budget) : ''}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Progress value={progress} />
                                        <p className="text-xs text-muted-foreground">{Math.round(progress)}% completado</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        )
    }

  return (
    <>
    <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Operaciones y Proyectos</h1>
          <p className="text-muted-foreground">
            Organiza tu trabajo, gestiona tus contactos y sigue el pulso de tu negocio.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Nuevo Proyecto
        </Button>
      </div>
      
      <Tabs defaultValue="proyectos" className="w-full">
        <TabsList>
          <TabsTrigger value="proyectos"><HardHat className="mr-2 h-4 w-4" />Proyectos</TabsTrigger>
          <TabsTrigger value="crm"><User className="mr-2 h-4 w-4" />CRM</TabsTrigger>
          <TabsTrigger value="tareas"><FileText className="mr-2 h-4 w-4" />Tareas</TabsTrigger>
          <TabsTrigger value="informes"><BarChart2 className="mr-2 h-4 w-4"/>Informes</TabsTrigger>
        </TabsList>

        <TabsContent value="proyectos" className="mt-6">
             <h2 className="text-2xl font-semibold mb-4">Proyectos en Curso</h2>
            {renderProjectsContent()}
        </TabsContent>
        <TabsContent value="crm" className="mt-6">
            <ContactosPage />
        </TabsContent>
        <TabsContent value="tareas" className="mt-6">
            <TareasPage />
        </TabsContent>
        <TabsContent value="informes" className="mt-6">
            <InformesPage />
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
