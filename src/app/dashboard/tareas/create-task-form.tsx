

'use client';

import { useState, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from '@/hooks/use-toast';
import { type Project } from '../proyectos/page';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';
import Link from 'next/link';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';

type TaskStatus = 'Pendiente' | 'En Progreso' | 'Completado';
type TaskPriority = 'Baja' | 'Media' | 'Alta';

interface CreateTaskFormProps {
  onClose: () => void;
  projects: Project[];
}

export function CreateTaskForm({ onClose, projects }: CreateTaskFormProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; }[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('sin-proyecto');
  const [status, setStatus] = useState<TaskStatus>('Pendiente');
  const [priority, setPriority] = useState<TaskPriority>('Media');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState<Date | undefined>();

  // Set current user as default assignee
  useEffect(() => {
    if (user) {
        setAssigneeId(user.uid);
    }
  }, [user]);

  // Fetch all users to populate the assignee dropdown
  useEffect(() => {
    const fetchUsers = async () => {
        if (!db) return;
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().displayName || 'Usuario sin nombre'
        }));
        setAllUsers(usersList);
    };
    fetchUsers();
  }, []);


  const handleCreateTask = async () => {
    if (!title) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'El título de la tarea es obligatorio.',
      });
      return;
    }
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para crear una tarea.' });
        return;
    }

    setIsLoading(true);

    const taskData = {
      ownerId: user.uid,
      title,
      description,
      projectId: projectId === 'sin-proyecto' ? null : projectId,
      status,
      priority,
      assigneeId: assigneeId || user.uid,
      dueDate: dueDate || null,
      createdAt: serverTimestamp(),
      isCompleted: status === 'Completado',
    };
    
    const tasksCollectionRef = collection(db, 'tasks');

    addDoc(tasksCollectionRef, taskData)
      .then(() => {
        toast({
          title: 'Tarea Creada',
          description: `La tarea "${title}" ha sido creada con éxito.`,
        });
        onClose();
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: tasksCollectionRef.path,
          operation: 'create',
          requestResourceData: taskData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Título de la Tarea</Label>
        <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Diseñar la página de inicio" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="task-description">Descripción</Label>
        <Textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Añadir más detalles sobre la tarea..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         <div className="space-y-2">
          <Label htmlFor="task-project">Proyecto</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger id="task-project">
              <SelectValue placeholder="Asociar a un proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sin-proyecto">Sin Proyecto</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-status">Estado</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
            <SelectTrigger id="task-status">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pendiente">Pendiente</SelectItem>
              <SelectItem value="En Progreso">En Progreso</SelectItem>
              <SelectItem value="Completado">Completado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task-assignee">Responsable</Label>
            {allUsers.length > 0 ? (
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger id="task-assignee">
                    <SelectValue placeholder="Asignar a un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                    {allUsers.map(u => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            ) : (
                 <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">No hay empleados.</p>
                     <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/finanzas?tab=nominas">
                           <PlusCircle className="mr-2 h-4 w-4"/> Añadir
                        </Link>
                    </Button>
                </div>
            )}
        </div>
         <div className="space-y-2">
          <Label>Fecha de Entrega</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dueDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "dd/MM/yyyy", {locale: es}) : <span>dd/mm/aaaa</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>
       <div className="space-y-2">
          <Label htmlFor="task-priority">Prioridad</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
            <SelectTrigger id="task-priority">
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Baja">Baja</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
       <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleCreateTask} disabled={isLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Tarea
          </Button>
        </div>
    </div>
  );
}
