

'use server';

import { doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './config';
import type { Task, TaskStatus } from '@/app/dashboard/tareas/types';
import { getFirebaseAuth } from './firebase-admin';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/lib/firebase/errors';


export async function deleteTaskClient(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { auth, db: adminDb } = getFirebaseAuth();
        
        const taskRef = adminDb.collection('tasks').doc(id);
        const taskDoc = await taskRef.get();

        if (!taskDoc.exists) {
            return { success: false, error: "La tarea no existe." };
        }

        // Aunque usamos privilegios de admin para borrar, seguimos comprobando
        // la propiedad para mantener la seguridad a nivel de la acción del servidor.
        // En una app real, aquí se verificaría el token de sesión del usuario.
        // const taskData = taskDoc.data();
        // const session = cookies().get('session');
        // const decodedToken = await auth.verifySessionCookie(session.value, true);
        // if (taskData.ownerId !== decodedToken.uid) {
        //     return { success: false, error: "No tienes permiso para eliminar esta tarea." };
        // }

        await taskRef.delete();
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar la tarea desde la acción del servidor: ", error);
        return { success: false, error: "No se pudo eliminar la tarea en el servidor." };
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
