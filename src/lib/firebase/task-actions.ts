
'use server';

import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import type { Task, TaskStatus } from '@/app/dashboard/tareas/types';

export async function deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "La base de datos no está inicializada." };
    }

    if (!id) {
        return { success: false, error: "Se requiere el ID de la tarea." };
    }

    try {
        await deleteDoc(doc(db, "tasks", id));
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar la tarea: ", error);
        return { success: false, error: "No se pudo eliminar la tarea. Revisa los permisos." };
    }
}


export async function updateTaskStatus(id: string, status: TaskStatus): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "La base de datos no está inicializada." };
    }

    if (!id) {
        return { success: false, error: "Se requiere el ID de la tarea." };
    }
    
    const taskRef = doc(db, 'tasks', id);

    try {
        await updateDoc(taskRef, { 
            status: status,
            isCompleted: status === 'Completado' 
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar estado de la tarea: ", error);
        return { success: false, error: "No se pudo actualizar el estado de la tarea." };
    }
}

export async function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'ownerId' | 'createdAt'>>): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "La base de datos no está inicializada." };
    }
    if (!id) {
        return { success: false, error: "Se requiere el ID de la tarea." };
    }

    try {
        const taskRef = doc(db, 'tasks', id);
        await updateDoc(taskRef, data);
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar la tarea:", error);
        return { success: false, error: "No se pudo actualizar la tarea. Revisa los permisos." };
    }
}
