
'use server';

import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { getFirebaseAuth } from './firebase-admin';
import type { Document } from '@/app/dashboard/documentos/page';
import { extractInvoiceData, type ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { processCsvInvoices, type ProcessCsvInvoicesOutput } from '@/ai/flows/process-csv-invoices';

export async function deleteDocument(id: string): Promise<{ success: boolean, error?: string }> {
    if (!db) {
        return { success: false, error: "La base de datos no está inicializada." };
    }
    if (!id) {
        return { success: false, error: "Se requiere el ID del documento." };
    }
    try {
        const docRef = doc(db, "invoices", id);
        await deleteDoc(docRef);
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar documento: ", error);
        return { success: false, error: error.message };
    }
}

export async function updateDocumentAction(id: string, documentData: Partial<Omit<Document, 'id' | 'ownerId' | 'fechaCreacion'>>): Promise<{ success: boolean; error?: string }> {
    try {
        const { db: adminDb } = getFirebaseAuth();
        const docRef = adminDb.collection('invoices').doc(id);
        await docRef.update(documentData);
        return { success: true };
    } catch (error: any) {
        console.error("Error al actualizar documento: ", error);
        return { success: false, error: 'No se pudo actualizar el documento.' };
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

export async function processCsvInvoicesAction(csvContent: string): Promise<{ data: ProcessCsvInvoicesOutput | null; error: string | null }> {
  if (!csvContent) {
    return { data: null, error: 'El contenido del CSV está vacío.' };
  }

  try {
    const result = await processCsvInvoices({ csvContent });
    return { data: result, error: null };
  } catch (e: any) {
    console.error('Error processing CSV with AI:', e);
    return { data: null, error: 'La IA no pudo procesar el archivo CSV. Revisa el formato y vuelve a intentarlo.' };
  }
}
