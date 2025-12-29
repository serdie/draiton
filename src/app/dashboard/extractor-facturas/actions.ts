'use server';

import { extractInvoiceData, ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';

export async function getInvoiceData(
  currentState: { output: ExtractInvoiceDataOutput | null; error: string | null },
  formData: FormData
): Promise<{ output: ExtractInvoiceDataOutput | null; error: string | null }> {
  const invoiceDataUri = formData.get('invoiceDataUri') as string;

  if (!invoiceDataUri) {
    return { output: null, error: "Por favor, sube una imagen de la factura." };
  }

  try {
    const result = await extractInvoiceData({ invoiceDataUri });
    return { output: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { output: null, error: "No se pudo extraer la información. Asegúrate de que la imagen sea clara y vuelve a intentarlo." };
  }
}
