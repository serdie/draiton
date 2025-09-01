
'use server';

import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import type { Document } from '@/app/dashboard/documentos/page';
import { extractInvoiceData, type ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { processCsvInvoices, type ProcessCsvInvoicesOutput } from '@/ai/flows/process-csv-invoices';

export async function deleteDocument(id: string): Promise<void> {
    if (!db) {
        throw new Error("La base de datos no está inicializada.");
    }
    if (!id) {
        throw new Error("Se requiere el ID del documento.");
    }
    const docRef = doc(db, "invoices", id);
    await deleteDoc(docRef);
}

export async function updateDocument(id: string, documentData: Partial<Omit<Document, 'id' | 'ownerId' | 'fechaCreacion'>>): Promise<void> {
    if (!db) {
        throw new Error("La base de datos no está inicializada.");
    }
    if (!id) {
        throw new Error("Se requiere el ID del documento para actualizar.");
    }
    const docRef = doc(db, "invoices", id);
    await updateDoc(docRef, documentData);
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
