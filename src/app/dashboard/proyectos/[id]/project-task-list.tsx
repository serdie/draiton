

'use client';

import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Pencil, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deleteTaskClient, updateTaskStatus } from '@/lib/firebase/task-actions';
import type { Task } from '../../tareas/types';
import { EditTaskModal } from '../../tareas/edit-task-modal';
import type { Project } from '../page';


interface ProjectTaskListProps {
    projectId: string;
    initialProgress: number;
    onProgressChange: (newProgress: number) => void;
}

export function ProjectTaskList({ projectId, initialProgress, onProgressChange }: ProjectTaskListProps) {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [progress, setProgress] = useState(initialProgress);
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<{ id: string; name: string; }[]>([]);


    useEffect(() => {
        setProgress(initialProgress);
    }, [initialProgress]);
    
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'tasks'), 
            where('projectId', '==', projectId),
            where('ownerId', '==', user.uid)
        );
        const unsubscribeTasks = onSnapshot(q, (snapshot) => {
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
        
        // Fetch projects and users for the edit modal
        const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
        const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
            const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(fetchedProjects);
        });

        const fetchUsers = async () => {
            const ownerQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
            const employeesQuery = query(collection(db, 'users'), where('companyOwnerId', '==', user.uid));
            const [ownerSnapshot, employeesSnapshot] = await Promise.all([getDocs(ownerQuery), getDocs(employeesQuery)]);
            const userList = new Map<string, { id: string; name: string }>();
            ownerSnapshot.forEach(doc => userList.set(doc.id, { id: doc.id, name: doc.data().displayName || 'Usuario sin nombre' }));
            employeesSnapshot.forEach(doc => userList.set(doc.id, { id: doc.id, name: doc.data().displayName || 'Usuario sin nombre' }));
            setUsers(Array.from(userList.values()));
        };
        fetchUsers();


        return () => {
            unsubscribeTasks();
            unsubscribeProjects();
        }
    }, [projectId, user, toast]);

    useEffect(() => {
        if (tasks.length === 0) {
            if(progress !== 0) {
              onProgressChange(0);
            }
            return;
        }
        const completedTasks = tasks.filter(t => t.isCompleted).length;
        const totalTasks = tasks.length;
        const newProgress = Math.round((completedTasks / totalTasks) * 100);

        if (newProgress !== progress) {
            setProgress(newProgress);
            onProgressChange(newProgress);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks]);
    
    const handleToggleTask = (taskId: string, currentStatus: boolean) => {
        updateTaskStatus(taskId, currentStatus ? 'Pendiente' : 'Completado').catch(
          () => {
            // Error is handled by the global error emitter, no need to toast here
          }
        );
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !user) return;
        const taskData = {
            title: newTaskTitle,
            isCompleted: false,
            projectId,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            status: 'Pendiente',
            priority: 'Media',
            assigneeId: user.uid,
        };

        try {
          await addDoc(collection(db, 'tasks'), taskData);
          setNewTaskTitle('');
        } catch (error) {
            console.error("Error al crear tarea:", error);
            toast({
                variant: "destructive",
                title: "Error al guardar tarea",
                description: "No se pudo guardar la tarea en la base de datos. Revisa los permisos de Firestore y la consola para más detalles."
            });
        }
    };
    
    const handleDeleteTask = async () => {
        if (!taskToDelete) return;

        try {
            await deleteTaskClient(taskToDelete.id);
            toast({ title: 'Tarea Eliminada', description: 'La tarea ha sido eliminada correctamente.' });
        } catch (error) {
           // Error is emitted globally and will be displayed by the FirebaseErrorListener's toast
           // No need to show a generic error toast here
        } finally {
            setTaskToDelete(null);
        }
    };

    const handleSliderChange = (value: number[]) => {
        setProgress(value[0]);
    }
    
    const handleSliderCommit = (value: number[]) => {
        onProgressChange(value[0]);
    }
    
    const completedCount = useMemo(() => tasks.filter(t => t.isCompleted).length, [tasks]);

    return (
        <>
        {taskToEdit && (
            <EditTaskModal 
                isOpen={!!taskToEdit}
                onClose={() => setTaskToEdit(null)}
                task={taskToEdit}
                projects={projects}
                users={users}
            />
        )}
        <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará la tarea permanentemente.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <div className="space-y-6">
            <div className="space-y-2">
                 <div className="flex items-center justify-between">
                    <Label htmlFor="progress">Progreso:</Label>
                    <span className="text-primary font-semibold">{progress}%</span>
                </div>
                <Slider
                    id="progress"
                    value={[progress]}
                    onValueChange={handleSliderChange}
                    onValueCommit={handleSliderCommit}
                    max={100}
                    step={1}
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Checklist de Tareas ({completedCount}/{tasks.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                                <Checkbox
                                    id={`task-${task.id}`}
                                    checked={task.isCompleted}
                                    onCheckedChange={() => handleToggleTask(task.id, task.isCompleted)}
                                />
                                <Label
                                    htmlFor={`task-${task.id}`}
                                    className={`flex-1 text-sm ${task.isCompleted ? 'text-muted-foreground line-through' : ''}`}
                                >
                                    {task.title}
                                </Label>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setTaskToEdit(task)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setTaskToDelete(task)} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                         {tasks.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Aún no hay tareas en este proyecto. ¡Añade la primera!
                            </p>
                        )}
                    </div>
                     <form onSubmit={handleAddTask} className="mt-6 flex gap-2">
                        <Input
                            placeholder="Añadir nueva tarea..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <Button type="submit">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
        </>
    );
}
