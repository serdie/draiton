
'use client';

import { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import type { Project } from './page';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProjectStatus = Project['status'];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [budget, setBudget] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('Planificación');
  const [description, setDescription] = useState('');

  const resetForm = () => {
      setName('');
      setClient('');
      setStartDate(undefined);
      setEndDate(undefined);
      setBudget('');
      setStatus('Planificación');
      setDescription('');
  }

  const handleCreateProject = async () => {
    if (!name || !client) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'El nombre del proyecto y el cliente son obligatorios.',
      });
      return;
    }
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para crear un proyecto.' });
        return;
    }

    setIsLoading(true);

    const projectData = {
      ownerId: user.uid,
      name,
      client,
      description,
      startDate: startDate || null,
      endDate: endDate || null,
      budget: budget ? parseFloat(budget) : null,
      status,
      createdAt: serverTimestamp(),
    };

    try {
        await addDoc(collection(db, "projects"), projectData);
        toast({
            title: 'Proyecto Creado',
            description: `El proyecto "${name}" ha sido creado con éxito.`,
        });
        resetForm();
        onClose();
    } catch (error) {
        console.error("Error al crear proyecto:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo crear el proyecto. Revisa los permisos de Firestore.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Rellena los detalles para empezar un nuevo proyecto.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mr-6 pr-6 py-4 space-y-4">
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleCreateProject} disabled={isLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear Proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
