'use server';

import { collection, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './config';

export async function createExpense(data: any): Promise<{ success: boolean; error?: string }> {
  if (!db || !auth) {
    return { success: false, error: "La base de datos o la autenticación no están inicializadas." };
  }
  
  if (!auth.currentUser) {
      return { success: false, error: "No hay un usuario autenticado para crear el gasto." };
  }

  try {
    await addDoc(collection(db, "expenses"), {
      ...data,
      ownerId: auth.currentUser.uid,
      fechaCreacion: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error al crear gasto: ", error);
    return { success: false, error: error.message };
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
