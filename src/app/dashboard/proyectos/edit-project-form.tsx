
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useToast } from '@/hooks/use-toast';
import { type Project, type ProjectStatus } from './page';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface EditProjectFormProps {
  project: Project;
  onClose: () => void;
}

export function EditProjectForm({ project, onClose }: EditProjectFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(project.name);
  const [client, setClient] = useState(project.client);
  const [description, setDescription] = useState(project.description || '');
  const [startDate, setStartDate] = useState<Date | undefined>(project.startDate || undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(project.endDate || undefined);
  const [budget, setBudget] = useState(project.budget?.toString() || '');
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  
  const handleUpdateProject = async () => {
    if (!name || !client) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'El nombre del proyecto y el cliente son obligatorios.',
      });
      return;
    }
    setIsLoading(true);
    
    const projectRef = doc(db, "projects", project.id);
    const updatedData = {
        name,
        client,
        description,
        startDate: startDate || null,
        endDate: endDate || null,
        budget: budget ? parseFloat(budget) : null,
        status,
    };

    try {
        await updateDoc(projectRef, updatedData);
        toast({
            title: 'Proyecto Actualizado',
            description: `El proyecto "${name}" ha sido actualizado con éxito.`,
        });
        onClose();
    } catch (error) {
        console.error("Error al actualizar proyecto:", error);
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo actualizar el proyecto. Revisa los permisos.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="space-y-2">
        <Label htmlFor="project-name">Nombre del Proyecto</Label>
        <Input id="project-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Desarrollo Web Corporativa" />
        </div>
        <div className="space-y-2">
        <Label htmlFor="project-client">Cliente</Label>
        <Input id="project-client" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Ej: Cliente S.L." />
        </div>
        <div className="space-y-2">
        <Label htmlFor="project-description">Descripción</Label>
        <Textarea id="project-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descripción del alcance del proyecto..." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label>Fecha de Inicio</Label>
            <Popover>
            <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd MMM yyyy", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
            </PopoverContent>
            </Popover>
        </div>
        <div className="space-y-2">
            <Label>Fecha Fin Estimada</Label>
            <Popover>
            <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd MMM yyyy", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
            </PopoverContent>
            </Popover>
        </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="project-budget">Presupuesto (€)</Label>
            <Input id="project-budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Ej: 2500" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="project-status">Estado</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ProjectStatus)}>
                <SelectTrigger id="project-status">
                    <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Planificación">Planificación</SelectItem>
                    <SelectItem value="En Progreso">En Progreso</SelectItem>
                    <SelectItem value="En Espera">En Espera</SelectItem>
                    <SelectItem value="Completado">Completado</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                </SelectContent>
            </Select>
        </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button onClick={handleUpdateProject} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
            </Button>
        </div>
    </div>
  );
}

    