
'use client';

import { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

type Task = {
    id: string;
    title: string;
    isCompleted: boolean;
};

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

    useEffect(() => {
        setProgress(initialProgress);
    }, [initialProgress]);
    
    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'tasks'), where('projectId', '==', projectId), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            setTasks(fetchedTasks);
        });
        return () => unsubscribe();
    }, [projectId, user]);

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
    
    const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
        const taskRef = doc(db, 'tasks', taskId);
        await updateDoc(taskRef, { isCompleted: !currentStatus });
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !user) return;
        await addDoc(collection(db, 'tasks'), {
            title: newTaskTitle,
            isCompleted: false,
            projectId,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
        });
        setNewTaskTitle('');
    };

    const handleSliderChange = (value: number[]) => {
        setProgress(value[0]);
    }
    
    const handleSliderCommit = (value: number[]) => {
        onProgressChange(value[0]);
    }
    
    const completedCount = useMemo(() => tasks.filter(t => t.isCompleted).length, [tasks]);

    return (
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
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div key={task.id} className="flex items-center gap-3">
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
                            </div>
                        ))}
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
    );
}
