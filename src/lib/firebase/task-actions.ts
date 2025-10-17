

'use server';

import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
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


export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    if (!db) {
        throw new Error("La base de datos no está inicializada.");
    }
    if (!id) {
        throw new Error("Se requiere el ID de la tarea.");
    }
    
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, { 
        status: status,
        isCompleted: status === 'Completado' 
    });
}

export async function updateTask(id: string, data: Partial<Omit<Task, 'id' | 'ownerId' | 'createdAt'>>): Promise<void> {
    if (!db) {
        throw new Error("La base de datos no está inicializada.");
    }
    if (!id) {
        throw new Error("Se requiere el ID de la tarea.");
    }

    const taskRef = doc(db, 'tasks', id);

    // Asegurarse de que projectId se elimina si es `undefined` en lugar de guardarse como `null`.
    const dataToUpdate = { ...data };
    if (data.projectId === undefined) {
        dataToUpdate.projectId = (serverTimestamp() as any).delete();
    }
    
    await updateDoc(taskRef, dataToUpdate);
}
