
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type Task, type TaskPriority } from './types';
import type { Project } from '../proyectos/page';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock } from 'lucide-react';

interface TaskCardProps {
    task: Task;
    project?: Project;
}

const getPriorityBadgeClass = (priority: TaskPriority) => {
  switch (priority) {
    case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
    case 'Media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Baja': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-secondary text-secondary-foreground';
  }
};

const formatTimeTracked = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}


export function TaskCard({ task, project }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id, data: { status: task.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4 bg-card touch-none hover:border-primary">
        <CardContent className="p-3">
            <div className="flex justify-between items-start mb-2">
                 <p className="font-semibold text-sm">{task.title}</p>
                 <Badge variant="outline" className={getPriorityBadgeClass(task.priority)}>{task.priority}</Badge>
            </div>
            {project && (
                <Badge variant="secondary" className="text-xs font-normal mb-2">
                    {project.name}
                </Badge>
            )}
            <div className="flex justify-between items-center mt-2">
                 {task.dueDate && (
                    <p className="text-xs text-muted-foreground">
                        Vence: {format(task.dueDate, "dd MMM", { locale: es })}
                    </p>
                )}
                {task.timeTracked && task.timeTracked > 0 ? (
                    <Badge variant="outline" className="text-xs font-mono">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeTracked(task.timeTracked)}
                    </Badge>
                ) : (
                    <div />
                )}
            </div>
        </CardContent>
    </Card>
  );
}
