
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { type Project, type ProjectStatus } from '@/app/dashboard/proyectos/page';
import { type Task } from '@/app/dashboard/tareas/types';
import { type Document } from '@/app/dashboard/documentos/page';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, FileText, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

const getDocumentStatusBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pagado': return 'bg-green-100 text-green-800 border-green-200';
    case 'pendiente':
    case 'enviado':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'vencido':
      return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};


export default function ClientPortalPage() {
  const params = useParams();
  const portalId = params?.portalId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invoices, setInvoices] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portalId) {
      setError('ID de portal no válido.');
      setLoading(false);
      return;
    }

    const projectsQuery = query(collection(db, 'projects'), where('clientPortalId', '==', portalId));

    const unsubscribe = onSnapshot(projectsQuery, (querySnapshot) => {
      if (querySnapshot.empty) {
        setError('No se encontró ningún proyecto para este portal o no está activado.');
        setLoading(false);
        return;
      }
      
      const projectDoc = querySnapshot.docs[0];
      const projectData = projectDoc.data() as Project;

      if (!projectData.clientPortalActive) {
          setError('El portal para este proyecto no está activo.');
          setLoading(false);
          return;
      }

      setProject({
          id: projectDoc.id, 
          ...projectData,
          startDate: projectData.startDate ? (projectData.startDate as any).toDate() : null,
          endDate: projectData.endDate ? (projectData.endDate as any).toDate() : null,
      });

      // Fetch tasks and invoices for this project
      const tasksQuery = query(collection(db, 'tasks'), where('projectId', '==', projectDoc.id));
      const invoicesQuery = query(collection(db, 'invoices'), where('projectId', '==', projectDoc.id));

      onSnapshot(tasksQuery, (tasksSnapshot) => {
          setTasks(tasksSnapshot.docs.map(doc => doc.data() as Task));
      });

      onSnapshot(invoicesQuery, (invoicesSnapshot) => {
          setInvoices(invoicesSnapshot.docs.map(doc => ({...doc.data(), fechaEmision: (doc.data().fechaEmision as any).toDate()}) as Document));
      });

      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('Error al cargar los datos del proyecto.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [portalId]);


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Cargando portal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-center">
         <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-destructive">Acceso Restringido</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
         </Card>
      </div>
    );
  }

  if (!project) return null;
  
  const completedTasks = tasks.filter(t => t.isCompleted).length;

  return (
    <div className="min-h-screen bg-muted/40">
        <header className="bg-background border-b">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/logo1.jpg?alt=media&token=a1592962-ac39-48cb-8cc1-55d21909329e" alt="Draiton Logo" width={110} height={40} className="h-7 w-auto"/>
                </div>
                 <p className="text-sm text-muted-foreground">Proyecto de <span className="font-semibold text-foreground">{project.client}</span></p>
            </div>
        </header>

        <main className="container mx-auto py-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl">{project.name}</CardTitle>
                                <CardDescription>Resumen del estado actual del proyecto.</CardDescription>
                            </div>
                            <Badge className={getStatusBadgeClass(project.status)}>{project.status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Progreso</span>
                                    <span className="font-semibold">{project.progress || 0}%</span>
                                </div>
                                <Progress value={project.progress || 0} />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div><p className="text-muted-foreground">Cliente</p><p className="font-semibold">{project.client}</p></div>
                                <div><p className="text-muted-foreground">Fecha Inicio</p><p className="font-semibold">{project.startDate ? format(project.startDate, 'dd MMM yyyy', {locale: es}) : 'N/D'}</p></div>
                                <div><p className="text-muted-foreground">Fecha Fin</p><p className="font-semibold">{project.endDate ? format(project.endDate, 'dd MMM yyyy', {locale: es}) : 'N/D'}</p></div>
                                <div><p className="text-muted-foreground">Presupuesto</p><p className="font-semibold">{project.budget ? `${project.budget.toLocaleString('es-ES')}€` : 'N/D'}</p></div>
                             </div>
                        </div>
                    </CardContent>
                </Card>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle>Lista de Tareas ({completedTasks}/{tasks.length})</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {tasks.map(task => (
                                    <li key={task.id} className="flex items-center gap-3">
                                        {task.isCompleted ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-yellow-500" />}
                                        <span className={task.isCompleted ? 'text-muted-foreground line-through' : ''}>{task.title}</span>
                                    </li>
                                ))}
                                {tasks.length === 0 && <p className="text-sm text-muted-foreground">No hay tareas definidas para este proyecto.</p>}
                            </ul>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Facturas y Pagos</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nº</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Importe</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map(invoice => (
                                         <TableRow key={invoice.id}>
                                            <TableCell>{invoice.numero}</TableCell>
                                            <TableCell>{format(invoice.fechaEmision, 'dd/MM/yy')}</TableCell>
                                            <TableCell>{invoice.importe.toFixed(2)}€</TableCell>
                                            <TableCell><Badge variant="outline" className={getDocumentStatusBadgeClass(invoice.estado)}>{invoice.estado}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                    {invoices.length === 0 && (
                                         <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24">No hay facturas para este proyecto.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    </div>
  );
}
