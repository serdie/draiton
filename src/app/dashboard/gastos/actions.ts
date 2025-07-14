
'use server';

import { extractReceiptData, type ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';

export async function scanReceiptAction(receiptDataUri: string): Promise<{ data: ExtractReceiptDataOutput | null; error: string | null }> {
  if (!receiptDataUri) {
    return { data: null, error: 'No se ha proporcionado ninguna imagen.' };
  }

  try {
    const result = await extractReceiptData({ receiptDataUri });
    return { data: result, error: null };
  } catch (e: any)
  {
    console.error(e);
    return { data: null, error: 'No se pudo extraer la información del ticket. Asegúrate de que la imagen sea clara.' };
  }
}
