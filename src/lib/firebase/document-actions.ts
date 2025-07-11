
'use server';

import { collection, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export async function createDocument(data: any): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "La base de datos no está inicializada." };
  }
  
  if (!data.cliente || !data.tipo) {
      return { success: false, error: "El cliente y el tipo de documento son obligatorios." };
  }

  try {
    await addDoc(collection(db, "documents"), {
      ...data,
      fechaCreacion: serverTimestamp(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error al crear documento: ", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDocument(id: string): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "La base de datos no está inicializada." };
    }

    if (!id) {
        return { success: false, error: "Se requiere el ID del documento." };
    }

    try {
        await deleteDoc(doc(db, "documents", id));
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar documento: ", error);
        return { success: false, error: error.message };
    }
}
