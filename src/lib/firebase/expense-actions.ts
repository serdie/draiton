
'use server';

import { collection, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export async function createExpense(data: any, ownerId: string): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "La base de datos no está inicializada." };
  }
  
  if (!ownerId) {
      return { success: false, error: "No hay un usuario autenticado para crear el gasto." };
  }

  try {
    await addDoc(collection(db, "expenses"), {
      ...data,
      ownerId: ownerId,
      fechaCreacion: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error al crear gasto: ", error);
     // Devuelve un mensaje de error más específico si es un problema de permisos
    if (error.code === 'permission-denied') {
        return { success: false, error: "Permiso denegado. Revisa que las reglas de Firestore para 'expenses' son correctas." };
    }
    return { success: false, error: "Ocurrió un error inesperado al guardar el gasto." };
  }
}

export async function deleteExpense(id: string): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "La base de datos no está inicializada." };
    }

    if (!id) {
        return { success: false, error: "Se requiere el ID del gasto." };
    }

    try {
        await deleteDoc(doc(db, "expenses", id));
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar gasto: ", error);
        return { success: false, error: error.message };
    }
}
