

'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Loader2, User, HardHat, FileText, BarChart2, Clock, Lock } from 'lucide-react';
import { CreateProjectModal } from './create-project-modal';
import { AuthContext } from '@/context/auth-context';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { KanbanBoard } from './kanban-board';
import { CreateTaskModal } from '../tareas/create-task-modal';
import TareasPage from '../tareas/page';
import InformesPage from '../informes/page';
import { FichajesTab } from './fichajes-tab';
import ContactosPage from '../contactos/page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FichajeEmpleadoTab } from './fichaje-empleado-tab';


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
  clientPortalActive?: boolean;
  clientPortalId?: string;
};

export const projectStatuses: ProjectStatus[] = ['Planificación', 'En Progreso', 'En Espera', 'Completado', 'Cancelado'];

export default function OperacionesPage() {
    const { user, isPro, isEmpresa, isEmployee } = useContext(AuthContext);
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(isEmployee ? 'fichajes' : 'proyectos');
    
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
    
    const handleTabChange = (value: string) => {
        if (value === 'fichajes' && !isEmpresa && !isEmployee && isPro) {
            setIsUpsellModalOpen(true);
        } else {
            setActiveTab(value);
        }
    };
    
    const closeUpsellModalAndResetTab = () => {
        setIsUpsellModalOpen(false);
        setActiveTab('proyectos');
    };

    const tabsForOwner = [
        { value: 'proyectos', label: 'Proyectos', icon: HardHat },
        { value: 'crm', label: 'CRM', icon: User },
        { value: 'tareas', label: 'Tareas', icon: FileText },
        { value: 'fichajes', label: 'Fichajes', condition: isEmpresa },
        { value: 'informes', label: 'Informes', icon: BarChart2 }
    ];

    const tabsForEmployee = [
        { value: 'proyectos', label: 'Proyectos', icon: HardHat },
        { value: 'tareas', label: 'Tareas', icon: FileText },
        { value: 'fichajes', label: 'Mi Fichaje', icon: Clock },
        { value: 'informes', label: 'Informes', icon: BarChart2 }
    ];

    const visibleTabs = isEmployee ? tabsForEmployee : tabsForOwner.filter(tab => tab.condition !== false);

  return (
    <>
    <CreateProjectModal isOpen={isCreateProjectModalOpen} onClose={() => setIsCreateProjectModalOpen(false)} />
    <CreateTaskModal 
        isOpen={isCreateTaskModalOpen} 
        onClose={() => setIsCreateTaskModalOpen(false)} 
        projects={projects}
        users={[]}
    />
    <AlertDialog open={isUpsellModalOpen} onOpenChange={setIsUpsellModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary"/>
                Función del Plan Empresa
            </AlertDialogTitle>
            <AlertDialogDescription>
              El sistema de fichajes de empleados es una herramienta avanzada disponible en el plan Empresa. Mejora tu plan para gestionar el tiempo de tu equipo de forma eficiente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeUpsellModalAndResetTab}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Operaciones y Proyectos</h1>
          <p className="text-muted-foreground">
            Organiza tu trabajo, gestiona tus contactos y sigue el pulso de tu negocio.
          </p>
        </div>
         <div className="flex gap-2">
            {!isEmployee && (
                <Button variant="outline" onClick={() => setIsCreateTaskModalOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Tarea
                </Button>
            )}
            {!isEmployee && (
                <Button onClick={() => setIsCreateProjectModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Proyecto
                </Button>
            )}
         </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          {visibleTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
                <tab.icon className="mr-2 h-4 w-4" />{tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="proyectos" className="mt-6">
            <KanbanBoard projects={projects} loading={loading} />
        </TabsContent>
        <TabsContent value="crm" className="mt-6">
            <ContactosPage />
        </TabsContent>
        <TabsContent value="tareas" className="mt-6">
            <TareasPage />
        </TabsContent>
        <TabsContent value="fichajes" className="mt-6">
            {isEmployee ? <FichajeEmpleadoTab /> : isEmpresa ? <FichajesTab /> : null}
        </TabsContent>
        <TabsContent value="informes" className="mt-6">
            <InformesPage />
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
