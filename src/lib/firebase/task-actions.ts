
'use server';

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

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
