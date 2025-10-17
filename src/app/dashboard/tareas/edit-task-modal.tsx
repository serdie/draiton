
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EditTaskForm } from './edit-task-form';
import type { Task } from './types';
import type { Project } from '../proyectos/page';


interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projects: Project[];
  users: { id: string; name: string; }[];
}

export function EditTaskModal({ isOpen, onClose, task, projects, users }: EditTaskModalProps) {
  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Tarea</DialogTitle>
          <DialogDescription>
            Modifica los detalles de la tarea.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto -mr-6 pr-6 py-4">
          <EditTaskForm task={task} onClose={onClose} projects={projects} users={users} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
