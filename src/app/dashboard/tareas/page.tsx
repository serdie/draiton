
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

        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch projects
                const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', user.uid));
                const projectsUnsubscribe = onSnapshot(projectsQuery, (snapshot) => {
                    const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                    setProjects(fetchedProjects);
                });

                // Fetch tasks
                const tasksQuery = query(collection(db, 'tasks'), where('ownerId', '==', user.uid));
                const tasksUnsubscribe = onSnapshot(tasksQuery, (snapshot) => {
                    const fetchedTasks = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            ...data,
                            dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : undefined,
                            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
                        } as Task;
                    });
                    setTasks(fetchedTasks);
                });

                 // Fetch users: both the owner and their employees
                const employeesQuery = query(collection(db, 'users'), where('companyOwnerId', '==', user.uid));
                const selfQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
                
                const [employeesSnapshot, selfSnapshot] = await Promise.all([
                    getDocs(employeesQuery),
                    getDocs(selfQuery),
                ]);
                
                const employeesList = employeesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().displayName || 'Usuario sin nombre' }));
                const selfList = selfSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().displayName || 'Usuario sin nombre' }));

                const allUsersMap = new Map<string, { id: string; name: string; }>();
                // Add owner first to ensure they are in the list
                selfList.forEach(u => allUsersMap.set(u.id, u));
                // Add employees, which will overwrite if ID is the same but that's fine
                employeesList.forEach(u => allUsersMap.set(u.id, u));
                
                setUsers(Array.from(allUsersMap.values()));


                setLoading(false);
                return () => {
                    projectsUnsubscribe();
                    tasksUnsubscribe();
                };
            } catch (error) {
                console.error("Error fetching dashboard data: ", error);
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los datos.' });
                setLoading(false);
            }
        };

        const unsubscribePromise = fetchAllData();
        
        return () => {
            unsubscribePromise.then(fn => fn && fn());
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
