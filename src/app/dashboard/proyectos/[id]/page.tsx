
'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';
import { type Project, type ProjectStatus } from '../page';
import { type Task } from '../../tareas/types';
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
import { TimeTracker } from './time-tracker';
import { useToast } from '@/hooks/use-toast';

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
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<{ id: string; name: string; }[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !projectId) return;

    // Fetch the single project
    const docRef = doc(db, 'projects', projectId);
    const unsubscribeProject = onSnapshot(docRef, (docSnap) => {
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

    // Fetch all projects for the dropdown
    const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
        const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(fetchedProjects);
    });

     // Fetch tasks for this project
    const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        where('ownerId', '==', user.uid)
    );
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        const fetchedTasks = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                dueDate: data.dueDate ? data.dueDate.toDate() : undefined,
                createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            } as Task;
        });
        setTasks(fetchedTasks);
    }, (error) => {
        console.error("Error fetching tasks:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las tareas. Revisa los permisos.' });
    });

    // Fetch all users (owner + employees) for the dropdown
    const fetchUsers = async () => {
        const userList = new Map<string, { id: string; name: string; }>();
        // Fetch owner
        const selfDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        selfDoc.forEach(doc => {
            userList.set(doc.id, { id: doc.id, name: doc.data().displayName || 'Usuario sin nombre' });
        });
        // Fetch employees
        const employeesQuery = query(collection(db, 'users'), where('companyOwnerId', '==', user.uid));
        const employeesSnapshot = await getDocs(employeesQuery);
        employeesSnapshot.forEach(doc => {
            userList.set(doc.id, { id: doc.id, name: doc.data().displayName || 'Usuario sin nombre' });
        });
        setUsers(Array.from(userList.values()));
    }
    fetchUsers();


    return () => {
        unsubscribeProject();
        unsubscribeProjects();
        unsubscribeTasks();
    };
  }, [user, projectId, router, toast]);

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
                        projects={projects}
                        users={users}
                        tasks={tasks}
                    />
                </TabsContent>
                 <TabsContent value="time">
                    <TimeTracker tasks={tasks} />
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
