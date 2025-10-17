
'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '@/hooks/use-toast';
import { TaskCard } from './task-card';
import { type Task, type TaskStatus, taskStatuses } from './types';
import type { Project } from '../proyectos/page';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { updateTaskStatus } from '@/lib/firebase/task-actions';

interface TaskKanbanBoardProps {
    tasks: Task[];
    projects: Project[];
}

function KanbanColumn({ status, tasks, projects }: { status: TaskStatus; tasks: Task[]; projects: Project[] }) {
    const { setNodeRef } = useSortable({ id: status, data: {type: 'column'} });

    return (
        <div ref={setNodeRef} className="w-full md:w-1/3 flex flex-col gap-2">
            <h3 className="font-semibold">{status} ({tasks.length})</h3>
            <div className="bg-secondary p-2 rounded-lg min-h-[100px]">
                 <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            project={projects.find(p => p.id === task.projectId)} 
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}

export function TaskKanbanBoard({ tasks, projects }: TaskKanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const { toast } = useToast();
    const isMobile = useIsMobile();
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const columns = useMemo(() => {
        return taskStatuses.reduce((acc, status) => {
            acc[status] = tasks.filter(t => t.status === status);
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [tasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        if (task) {
            setActiveTask(task);
        }
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;
        
        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;
        
        const overStatus = over.data.current?.status || (over.data.current?.type === 'column' ? over.id : null);
        const task = tasks.find(t => t.id === activeId);

        if (task && overStatus && task.status !== overStatus) {
            const { success, error } = await updateTaskStatus(task.id, overStatus as TaskStatus);
            if (success) {
                 toast({
                    title: 'Tarea actualizada',
                    description: `El estado de "${task.title}" se cambió a "${overStatus}".`
                });
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error
                });
            }
        }
    };
    
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className={cn("flex gap-4 p-2 -m-2", isMobile ? "flex-col" : "flex-row")}>
                {taskStatuses.map(status => (
                    <KanbanColumn 
                        key={status} 
                        status={status} 
                        tasks={columns[status] || []}
                        projects={projects}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} project={projects.find(p => p.id === activeTask.projectId)} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
