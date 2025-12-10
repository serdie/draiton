
'use server';

import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './config';
import type { Task, TaskStatus } from '@/app/dashboard/tareas/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';


export async function deleteTaskClient(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!db) {
            return { success: false, error: "La base de datos no está inicializada." };
        }
        const taskRef = doc(db, 'tasks', id);
        await deleteDoc(taskRef);
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar la tarea desde la acción del servidor: ", error);
        // We can check for permission error codes here if needed, e.g., error.code === 'permission-denied'
        return { success: false, error: "No se pudo eliminar la tarea en el servidor." };
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
    const updatedData = { 
        status: status,
        isCompleted: status === 'Completado' 
    };

    updateDoc(taskRef, updatedData).catch((serverError) => {
         const permissionError = new FirestorePermissionError({
            path: taskRef.path,
            operation: 'update',
            requestResourceData: updatedData
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError;
    });
}
