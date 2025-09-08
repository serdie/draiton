
'use server';

import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './config';
import { processCsvExpenses, type ProcessCsvExpensesOutput } from '@/ai/flows/process-csv-expenses';
import { processPdfExpenses, type ProcessPdfExpensesOutput } from '@/ai/flows/process-pdf-expenses';

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

export async function processCsvExpensesAction(csvContent: string): Promise<{ data: ProcessCsvExpensesOutput | null; error: string | null }> {
  if (!csvContent) {
    return { data: null, error: 'El contenido del CSV está vacío.' };
  }

  try {
    const result = await processCsvExpenses({ csvContent });
    return { data: result, error: null };
  } catch (e: any) {
    console.error('Error processing CSV with AI:', e);
    return { data: null, error: 'La IA no pudo procesar el archivo CSV. Revisa el formato y vuelve a intentarlo.' };
  }
}

export async function processPdfExpensesAction(pdfDataUri: string): Promise<{ data: ProcessPdfExpensesOutput | null; error: string | null }> {
  if (!pdfDataUri) {
    return { data: null, error: 'No se ha proporcionado el archivo PDF.' };
  }

  try {
    const result = await processPdfExpenses({ pdfDataUri });
    return { data: result, error: null };
  } catch (e: any) {
    console.error('Error processing PDF with AI:', e);
    return { data: null, error: 'La IA no pudo procesar el archivo PDF. Revisa el archivo y vuelve a intentarlo.' };
  }
}
