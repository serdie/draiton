
'use server';

import { collection, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { extractInvoiceData, type ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';

export async function createDocument(data: any): Promise<{ success: boolean; error?: string }> {
  if (!db) {
    return { success: false, error: "La base de datos no está inicializada." };
  }
  
  if (!data.ownerId) {
      return { success: false, error: "No hay un usuario autenticado para crear el documento." };
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

export async function scanInvoiceAction(invoiceDataUri: string): Promise<{ data: ExtractInvoiceDataOutput | null; error: string | null }> {
  if (!invoiceDataUri) {
    return { data: null, error: 'No se ha proporcionado ninguna imagen.' };
  }

  try {
    const result = await extractInvoiceData({ invoiceDataUri });
    return { data: result, error: null };
  } catch (e: any)
  {
    console.error(e);
    return { data: null, error: 'No se pudo extraer la información de la factura. Asegúrate de que la imagen sea clara.' };
  }
}
