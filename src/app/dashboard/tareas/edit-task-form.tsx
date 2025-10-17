
'use client';

import { useState, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from '@/hooks/use-toast';
import { type Project } from '../proyectos/page';
import { AuthContext } from '@/context/auth-context';
import { type Task, type TaskStatus, type TaskPriority } from './types';
import { updateTask } from '@/lib/firebase/task-actions';

interface EditTaskFormProps {
  onClose: () => void;
  task: Task;
  projects: Project[];
  users: { id: string; name: string }[];
}

export function EditTaskForm({ onClose, task, projects, users }: EditTaskFormProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state, initialized directly from the task prop
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [projectId, setProjectId] = useState<string>(task.projectId || 'sin-proyecto');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState<string>(task.assigneeId);
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate);

  // This effect ensures the form state resets if a new task is passed to an already-open modal.
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setProjectId(task.projectId || 'sin-proyecto');
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(task.assigneeId);
    setDueDate(task.dueDate);
  }, [task]);


  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast({ variant: 'destructive', title: 'Error de validación', description: 'El título de la tarea es obligatorio.' });
      return;
    }
    
    setIsLoading(true);

    const taskData: Partial<Task> = {
      title,
      description,
      projectId: projectId === 'sin-proyecto' ? undefined : projectId,
      status,
      priority,
      assigneeId,
      dueDate,
      isCompleted: status === 'Completado',
    };
    
    try {
        await updateTask(task.id, taskData);
        toast({ title: 'Tarea Actualizada', description: `La tarea "${title}" ha sido actualizada.` });
        onClose();
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Error al actualizar',
            description: error.message || "No se pudo actualizar la tarea. Revisa los permisos."
        });
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleUpdateTask} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Título de la Tarea</Label>
        <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="task-description">Descripción</Label>
        <Textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} />
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
            <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger id="task-assignee">
                    <SelectValue placeholder="Asignar a un usuario" />
                </SelectTrigger>
                <SelectContent>
                {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
                </SelectContent>
            </Select>
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
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button type="submit" disabled={isLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
    </form>
  );
}
