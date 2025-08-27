
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreateTaskForm } from './create-task-form';
import type { Project } from '../proyectos/page';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

export function CreateTaskModal({ isOpen, onClose, projects }: CreateTaskModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
          <DialogDescription>
            Rellena los detalles para añadir una nueva tarea a tu flujo de trabajo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mr-6 pr-6 py-4">
          <CreateTaskForm onClose={onClose} projects={projects} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
