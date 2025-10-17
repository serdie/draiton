

'use server';

import { doc, deleteDoc, updateDoc, FieldValue } from 'firebase/firestore';
import { db } from './config';
import type { Task, TaskStatus } from '@/app/dashboard/tareas/types';
import { getFirebaseAuth } from './firebase-admin';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';


export async function deleteTaskClient(id: string): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "La base de datos no está inicializada." };
    }
    if (!id) {
        return { success: false, error: "Se requiere el ID de la tarea." };
    }

    const taskRef = doc(db, 'tasks', id);
    
    try {
        await deleteDoc(taskRef);
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar la tarea:", error);
        // Devolvemos el mensaje de error para que el componente lo muestre
        return { success: false, error: error.message || "Error desconocido al eliminar la tarea." };
    }
}


export async function updateTask(id: string, updatedData: Partial<Task>): Promise<void> {
     if (!db) {
        throw new Error("La base de datos no está inicializada.");
    }
    if (!id) {
        throw new Error("Se requiere el ID de la tarea.");
    }

    const taskRef = doc(db, 'tasks', id);
    
    try {
        await updateDoc(taskRef, updatedData);
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: taskRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
        throw serverError; // Re-throw for local handling
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
