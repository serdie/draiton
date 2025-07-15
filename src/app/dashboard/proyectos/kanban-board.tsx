
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
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Project, type ProjectStatus, projectStatuses } from './page';
import { cn } from '@/lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';

function getStatusBadgeClass(status: ProjectStatus) {
  switch (status) {
    case 'En Progreso': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Planificación': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Completado': return 'bg-green-100 text-green-800 border-green-200';
    case 'En Espera': return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'Cancelado': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-secondary text-secondary-foreground';
  }
}

function ProjectCard({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: project.id, data: { status: project.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4 bg-card touch-none">
      <CardHeader className="p-4">
        <CardTitle className="text-base">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">{project.client}</p>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{project.startDate ? format(project.startDate, "dd MMM yyyy", { locale: es }) : ''}</span>
            <span>{project.budget ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(project.budget) : ''}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ status, projects }: { status: ProjectStatus; projects: Project[] }) {
    const { setNodeRef } = useSortable({ id: status, data: { isContainer: true } });

    return (
        <div ref={setNodeRef} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 shrink-0">
            <Card className="bg-muted/50 h-full">
                <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2">
                         <Badge variant="outline" className={cn('font-semibold text-sm', getStatusBadgeClass(status))}>
                            {status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{projects.length}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </SortableContext>
                </CardContent>
            </Card>
        </div>
    )
}

export function KanbanBoard({ projects, loading }: { projects: Project[]; loading: boolean }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = useMemo(() => {
    return projectStatuses.reduce((acc, status) => {
        acc[status] = projects.filter(p => p.status === status);
        return acc;
    }, {} as Record<ProjectStatus, Project[]>);
  }, [projects]);
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find(p => p.id === active.id);
    if (project) {
        setActiveProject(project);
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over || active.id === over.id) {
        return;
    }
    
    // Si se suelta sobre una columna
    const newStatus = over.id as ProjectStatus;
    const project = projects.find(p => p.id === active.id);

    if (project && project.status !== newStatus && projectStatuses.includes(newStatus)) {
        const projectRef = doc(db, 'projects', project.id);
        try {
            await updateDoc(projectRef, { status: newStatus });
            toast({
                title: 'Proyecto actualizado',
                description: `El estado de "${project.name}" se cambió a "${newStatus}".`
            });
        } catch (error) {
            console.error("Error al actualizar el estado del proyecto:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo actualizar el estado del proyecto.'
            });
        }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
        <div className="flex gap-4 overflow-x-auto p-2 -m-2">
            <SortableContext items={projectStatuses} >
            {projectStatuses.map(status => (
                <KanbanColumn key={status} status={status} projects={columns[status] || []} />
            ))}
            </SortableContext>
        </div>
        <DragOverlay>
            {activeProject ? <ProjectCard project={activeProject} /> : null}
        </DragOverlay>
    </DndContext>
  );
}
