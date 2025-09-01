
'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';
import { type Project, type ProjectStatus } from '../page';
import { Loader2, ArrowLeft, Briefcase, FileText, Clock, User, HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { EditProjectModal } from '../edit-project-modal';
import { ProjectTaskList } from './project-task-list';

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

const TimeTrackingCard = () => (
    <Card>
        <CardHeader>
            <CardTitle>Seguimiento de Tiempo</CardTitle>
            <CardDescription>Registra el tiempo dedicado a este proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
             <div className="text-4xl font-bold font-mono">01:23:45</div>
             <div className="flex gap-2">
                <Button>Iniciar</Button>
                <Button variant="outline">Pausar</Button>
                <Button variant="destructive">Detener</Button>
             </div>
        </CardContent>
        <CardFooter>
            <p className="text-sm text-muted-foreground">El tiempo registrado se puede añadir a una factura.</p>
        </CardFooter>
    </Card>
)

const ClientPortalCard = () => (
     <Card>
        <CardHeader>
            <CardTitle>Portal de Cliente</CardTitle>
            <CardDescription>Gestiona el acceso de tu cliente a este proyecto.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                    <p className="font-medium">Estado del Portal</p>
                    <p className="text-sm text-muted-foreground">El cliente puede ver el progreso y descargar facturas.</p>
                </div>
                <Badge variant="default">Activo</Badge>
            </div>
             <Button>Enviar invitación al cliente</Button>
             <Button variant="outline">Ver portal como cliente</Button>
        </CardContent>
    </Card>
)

export default function ProjectDetailPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user || !projectId) return;

    const docRef = doc(db, 'projects', projectId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.ownerId === user.uid) {
          setProject({
            id: docSnap.id,
            ...data,
            startDate: data.startDate?.toDate(),
            endDate: data.endDate?.toDate(),
            createdAt: data.createdAt?.toDate(),
          } as Project);
        } else {
          router.push('/dashboard/proyectos');
        }
      } else {
         router.push('/dashboard/proyectos');
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching project details:", error);
        router.push('/dashboard/proyectos');
    });

    return () => unsubscribe();
  }, [user, projectId, router]);

   const handleProgressChange = async (newProgress: number) => {
    if (!project) return;
    try {
        const projectRef = doc(db, 'projects', project.id);
        await updateDoc(projectRef, { progress: newProgress });
        // El estado local se actualizará a través del listener onSnapshot
    } catch (error) {
        console.error("Error al actualizar el progreso del proyecto:", error);
    }
  };


  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
        <div className="text-center">
            <p>Proyecto no encontrado o no tienes permiso para verlo.</p>
             <Button onClick={() => router.push('/dashboard/proyectos')} className="mt-4">
                Volver a Proyectos
             </Button>
        </div>
    )
  }

  return (
    <>
    {project && (
        <EditProjectModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            project={project}
        />
    )}
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
             <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/proyectos')}>
                <ArrowLeft className="h-4 w-4" />
             </Button>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">{project.name}</h1>
                    <Badge className={getStatusBadgeClass(project.status)}>{project.status}</Badge>
                </div>
                <p className="text-muted-foreground">Proyecto para <span className="font-semibold">{project.client}</span></p>
            </div>
        </div>
         <Button onClick={() => setIsEditModalOpen(true)}>Editar Proyecto</Button>
      </div>
      
      <Card>
        <CardHeader>
            <CardTitle>Información General</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Presupuesto</p>
                <p className="text-2xl font-bold">{project.budget ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(project.budget) : 'N/A'}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Fecha Inicio</p>
                <p className="text-lg font-semibold">{project.startDate ? format(project.startDate, "dd MMM, yyyy", {locale: es}) : 'N/A'}</p>
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Fecha Fin</p>
                <p className="text-lg font-semibold">{project.endDate ? format(project.endDate, "dd MMM, yyyy", {locale: es}) : 'N/A'}</p>
            </div>
             <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Creado</p>
                <p className="text-lg font-semibold">{project.createdAt ? formatDistanceToNow(project.createdAt, {locale: es, addSuffix: true}) : 'N/A'}</p>
            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
            <TabsList>
                <TabsTrigger value="tasks"><HardHat className="mr-2 h-4 w-4"/> Tareas</TabsTrigger>
                <TabsTrigger value="time"><Clock className="mr-2 h-4 w-4"/> Seguimiento de Tiempo</TabsTrigger>
                <TabsTrigger value="invoices"><FileText className="mr-2 h-4 w-4"/> Facturas</TabsTrigger>
                <TabsTrigger value="client-portal"><User className="mr-2 h-4 w-4"/> Portal Cliente</TabsTrigger>
            </TabsList>
            <div className="mt-4">
                <TabsContent value="tasks">
                    <ProjectTaskList 
                        projectId={project.id} 
                        initialProgress={project.progress || 0}
                        onProgressChange={handleProgressChange}
                    />
                </TabsContent>
                 <TabsContent value="time">
                    <TimeTrackingCard />
                </TabsContent>
                <TabsContent value="invoices">
                     <Card>
                        <CardHeader><CardTitle>Facturas del Proyecto</CardTitle></CardHeader>
                        <CardContent><p>Las facturas vinculadas a este proyecto aparecerán aquí.</p></CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="client-portal">
                    <ClientPortalCard />
                </TabsContent>
            </div>
        </Tabs>
    </div>
    </>
  );
}
