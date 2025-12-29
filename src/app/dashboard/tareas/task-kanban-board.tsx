
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
    onEditTask: (task: Task) => void;
}

function KanbanColumn({ status, tasks, projects, onEditTask }: { status: TaskStatus; tasks: Task[]; projects: Project[], onEditTask: (task: Task) => void; }) {
    const { setNodeRef } = useSortable({ id: status, data: {type: 'column'} });

    return (
        <div ref={setNodeRef} className="w-full md:w-1/3 flex flex-col gap-2">
            <h3 className="font-semibold">{status} ({tasks.length})</h3>
            <div className="bg-secondary p-2 rounded-lg min-h-[100px]">
                 <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <div key={task.id} onClick={() => onEditTask(task)} className="cursor-pointer">
                            <TaskCard 
                                task={task} 
                                project={projects.find(p => p.id === task.projectId)} 
                            />
                        </div>
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}

export function TaskKanbanBoard({ tasks, projects, onEditTask }: TaskKanbanBoardProps) {
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
            try {
                await updateTaskStatus(task.id, overStatus as TaskStatus);
                toast({
                    title: 'Tarea actualizada',
                    description: `El estado de "${task.title}" se cambió a "${overStatus}".`
                });
            } catch (error: any) {
                console.error("Error updating task status:", error);
                 toast({
                    variant: 'destructive',
                    title: 'Error al actualizar',
                    description: error.message || "No se pudo actualizar el estado de la tarea. Revisa los permisos."
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
                        onEditTask={onEditTask}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} project={projects.find(p => p.id === activeTask.projectId)} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
