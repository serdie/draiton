
'use server';

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

export async function deleteContact(id: string): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "La base de datos no está inicializada." };
    }

    if (!id) {
        return { success: false, error: "Se requiere el ID del contacto." };
    }

    try {
        await deleteDoc(doc(db, "contacts", id));
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar contacto: ", error);
        return { success: false, error: error.message };
    }
}
