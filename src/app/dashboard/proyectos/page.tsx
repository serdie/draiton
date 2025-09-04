

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
import { type Project } from '../proyectos/page';
import { KanbanBoard } from '../proyectos/kanban-board';
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
    const { user, isPro, isEmpresa } = useContext(AuthContext);
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('proyectos');
    
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
    
    const handleFichajesClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isEmpresa && isPro) {
            e.preventDefault();
            setIsUpsellModalOpen(true);
        }
    }

    const handleTabChange = (value: string) => {
        if (value === 'fichajes' && !isEmpresa && isPro) {
            setIsUpsellModalOpen(true);
        } else {
            setActiveTab(value);
        }
    };
    
    const closeUpsellModalAndResetTab = () => {
        setIsUpsellModalOpen(false);
        setActiveTab('proyectos');
    };

  return (
    <>
    <CreateProjectModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
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
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Crear Nuevo Proyecto
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="proyectos"><HardHat className="mr-2 h-4 w-4" />Proyectos</TabsTrigger>
          <TabsTrigger value="crm"><User className="mr-2 h-4 w-4" />CRM</TabsTrigger>
          <TabsTrigger value="tareas"><FileText className="mr-2 h-4 w-4" />Tareas</TabsTrigger>
          {(isPro || isEmpresa) && (
            <TabsTrigger value="fichajes" onClick={handleFichajesClick}>
                <Clock className="mr-2 h-4 w-4" />Fichajes
            </TabsTrigger>
          )}
          <TabsTrigger value="informes"><BarChart2 className="mr-2 h-4 w-4"/>Informes</TabsTrigger>
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
         {(isPro || isEmpresa) && isEmpresa && (
          <TabsContent value="fichajes" className="mt-6">
              <FichajesTab />
          </TabsContent>
        )}
        <TabsContent value="informes" className="mt-6">
            <InformesPage />
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}

