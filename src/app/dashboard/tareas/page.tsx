
'use client';

import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { TaskKanbanBoard } from './task-kanban-board';
import { CreateTaskModal } from './create-task-modal';
import { EditTaskModal } from './edit-task-modal';
import type { Project } from '../proyectos/page';
import type { Task } from './types';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, onSnapshot, Timestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export default function TareasPage() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<{ id: string; name: string; }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    useEffect(() => {
        if (!user || !db) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        setLoading(true);

        const handleError = (error: any, type: string) => {
            if (isMounted) {
                console.error(`Error fetching ${type}: `, error);
                toast({ variant: 'destructive', title: 'Error', description: `No se pudieron cargar los ${type}. Revisa los permisos de Firestore.` });
            }
        };

        const tasksQuery = query(collection(db, 'tasks'), where('ownerId', '==', user.uid));
        const tasksUnsubscribe = onSnapshot(tasksQuery, (tasksSnapshot) => {
            if (!isMounted) return;
            const fetchedTasks = tasksSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
                    createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
                } as Task;
            });
            setTasks(fetchedTasks);
        }, (error) => handleError(error, 'tareas'));

        const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
        const projectsUnsubscribe = onSnapshot(projectsQuery, (projectsSnapshot) => {
             if (!isMounted) return;
            const fetchedProjects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(fetchedProjects);
        }, (error) => handleError(error, 'proyectos'));
        
        const fetchUsers = async () => {
            const userList = new Map<string, { id: string; name: string; }>();
            const selfQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
            const employeesQuery = query(collection(db, 'users'), where('companyOwnerId', '==', user.uid));

            try {
                const [selfSnapshot, employeesSnapshot] = await Promise.all([getDocs(selfQuery), getDocs(employeesQuery)]);
                 if (!isMounted) return;
                selfSnapshot.forEach(doc => {
                    userList.set(doc.id, { id: doc.id, name: doc.data().displayName || 'Usuario sin nombre' });
                });
                employeesSnapshot.forEach(doc => {
                    userList.set(doc.id, { id: doc.id, name: doc.data().displayName || 'Usuario sin nombre' });
                });
                setUsers(Array.from(userList.values()));
            } catch (error) {
                handleError(error, 'usuarios');
            }
        };

        Promise.all([
           getDocs(tasksQuery),
           getDocs(projectsQuery),
           fetchUsers()
        ]).finally(() => {
            if (isMounted) setLoading(false);
        });

        return () => {
            isMounted = false;
            tasksUnsubscribe();
            projectsUnsubscribe();
        };

    }, [user, toast]);


    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
    }

    return (
        <>
            <CreateTaskModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                projects={projects}
                users={users}
            />
            {taskToEdit && (
                <EditTaskModal
                    isOpen={!!taskToEdit}
                    onClose={() => setTaskToEdit(null)}
                    task={taskToEdit}
                    projects={projects}
                    users={users}
                />
            )}
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Tablero de Tareas</h1>
                        <p className="text-muted-foreground">
                            Visualiza y organiza todas tus tareas en un solo lugar.
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Crear Tarea
                    </Button>
                </div>
                 {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <TaskKanbanBoard 
                        tasks={tasks} 
                        projects={projects} 
                        onEditTask={handleEditTask} 
                    />
                )}
            </div>
        </>
    );
}
