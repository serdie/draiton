
'use server';

import { collection, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export async function createContact(data: any, ownerId: string): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "La base de datos no está inicializada." };
  }
  
  if (!ownerId) {
      return { success: false, error: "No hay un usuario autenticado para crear el contacto." };
  }

  if (!data.name || !data.email || !data.type) {
      return { success: false, error: "El nombre, email y tipo de contacto son obligatorios." };
  }

  try {
    await addDoc(collection(db, "contacts"), {
      ...data,
      ownerId: ownerId,
      createdAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error al crear contacto: ", error);
    // Devuelve un mensaje de error más específico si es un problema de permisos
    if (error.code === 'permission-denied') {
        return { success: false, error: "Permiso denegado. Asegúrate de que las reglas de Firestore son correctas." };
    }
    return { success: false, error: "Ocurrió un error inesperado al guardar el contacto." };
  }
}

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
