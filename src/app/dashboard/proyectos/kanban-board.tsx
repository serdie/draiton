

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Project, type ProjectStatus, projectStatuses } from './page';
import { cn } from '@/lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';


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

const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}


function ProjectCard({ project }: { project: Project }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: project.id, data: { status: project.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Link href={`/dashboard/proyectos/${project.id}`}>
        <Card ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4 bg-card touch-none hover:border-primary">
            <CardContent className="p-4">
                <p className="font-semibold text-base mb-2">{project.name}</p>
                <p className="text-sm text-primary mb-3">{project.client}</p>
                <div className="flex justify-end">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={`https://i.pravatar.cc/32?u=${project.client}`} />
                        <AvatarFallback>{getInitials(project.client)}</AvatarFallback>
                    </Avatar>
                </div>
            </CardContent>
        </Card>
    </Link>
  );
}

function KanbanColumn({ status, projects }: { status: ProjectStatus; projects: Project[] }) {
    const { setNodeRef } = useSortable({ id: status, data: {type: 'column'} });

    return (
        <div ref={setNodeRef} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 2xl:w-1/5 flex flex-col gap-2">
            <h3 className="font-semibold">{status} ({projects.length})</h3>
            <div className="bg-secondary p-2 rounded-lg min-h-[100px]">
                 <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    {projects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}

export function KanbanBoard({ projects, loading }: { projects: Project[]; loading: boolean }) {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
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

    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;
    
    // This logic covers dragging card over a column, or over another card in a column
    const overStatus = over.data.current?.status || (over.data.current?.type === 'column' ? over.id : null);
    const project = projects.find(p => p.id === activeId);

    if (project && overStatus && project.status !== overStatus) {
         const projectRef = doc(db, 'projects', project.id);
         try {
            await updateDoc(projectRef, { status: overStatus });
            toast({
                title: 'Proyecto actualizado',
                description: `El estado de "${project.name}" se cambió a "${overStatus}".`
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
        <div className={cn("flex gap-4 p-2 -m-2", isMobile ? "flex-col" : "flex-row flex-wrap")}>
            {projectStatuses.map(status => {
                const projectsInColumn = columns[status] || [];
                if(isMobile && projectsInColumn.length === 0) return null; // Don't show empty columns on mobile
                return <KanbanColumn key={status} status={status} projects={projectsInColumn} />
            })}
        </div>
        <DragOverlay>
            {activeProject ? <ProjectCard project={activeProject} /> : null}
        </DragOverlay>
    </DndContext>
  );
}
