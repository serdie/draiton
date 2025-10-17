
export type TaskStatus = 'Pendiente' | 'En Progreso' | 'Completado';
export type TaskPriority = 'Baja' | 'Media' | 'Alta';

export type Task = {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  projectId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  dueDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
};

export const taskStatuses: TaskStatus[] = ['Pendiente', 'En Progreso', 'Completado'];
