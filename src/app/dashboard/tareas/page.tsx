
'use client';

import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { type Project } from '../proyectos/page';
import { KanbanBoard } from '../proyectos/kanban-board';
import { CreateTaskModal } from './create-task-modal';


export default function TareasPage() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
            setProjects(docsList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los proyectos.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

  return (
    <>
    <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        projects={projects}
    />
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Tablero de Tareas y Proyectos</h2>
            <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Tarea
            </Button>
        </div>
      <KanbanBoard projects={projects} loading={loading} />
    </div>
    </>
  );
}


