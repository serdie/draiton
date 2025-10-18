
'use server';

/**
 * @fileOverview A Genkit flow for processing a CSV file of invoices.
 *
 * - processCsvInvoices - A function that accepts CSV content and returns structured invoice data.
 * - ProcessCsvInvoicesInput - The input type for the function.
 * - ProcessCsvInvoicesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { z } from 'genkit';

const ProcessCsvInvoicesInputSchema = z.object({
  csvContent: z.string().describe('The full content of the CSV file as a string.'),
});
export type ProcessCsvInvoicesInput = z.infer<typeof ProcessCsvInvoicesInputSchema>;

const InvoiceSchema = z.object({
    numero: z.string().describe('El número de la factura.'),
    fechaEmision: z.string().describe('La fecha de emisión en formato YYYY-MM-DD.'),
    fechaVto: z.string().optional().describe('La fecha de vencimiento en formato YYYY-MM-DD.'),
    cliente: z.string().describe('El nombre del cliente.'),
    subtotal: z.number().describe('El importe neto de la factura.'),
    impuestos: z.number().describe('El importe total de IVA/IGIC.'),
    total: z.number().describe('El importe total de la factura.'),
    estado: z.string().describe('El estado de pago de la factura.'),
    moneda: z.string().describe('La moneda de la factura (EUR, USD, etc.).'),
});

const ProcessCsvInvoicesOutputSchema = z.object({
  invoices: z.array(InvoiceSchema).describe('Una lista de las facturas procesadas desde el CSV.'),
});
export type ProcessCsvInvoicesOutput = z.infer<typeof ProcessCsvInvoicesOutputSchema>;


export async function processCsvInvoices(input: ProcessCsvInvoicesInput): Promise<ProcessCsvInvoicesOutput> {
  return processCsvInvoicesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processCsvInvoicesPrompt',
  input: { schema: ProcessCsvInvoicesInputSchema },
  output: { schema: ProcessCsvInvoicesOutputSchema },
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an expert data processor. Your task is to analyze the provided CSV content, which contains multiple invoices, and convert it into a structured JSON format.

The CSV headers are: "N.º de factura", "Fecha", "Descripción", "Vencimiento", "Importe neto", "Recargo Equivalencia", "Retención", "Importe de IGIC", "Importe total", "Moneda", "Tipo de cambio", "Divisa contabilizada", "Importe neto contabilizado", "IVA contabilizado", "Importe total contabilizado", "Estado de pago", "Pagos y cobros (método, importe, fecha, notas)", "Cliente", "N.º de cliente", "CIF/NIF", "Fiscal code", "País", "VAT due mode", "Zona".

- Map "N.º de factura" to "numero".
- Map "Fecha" to "fechaEmision".
- Map "Vencimiento" to "fechaVto".
- Map "Cliente" to "cliente".
- Map "Importe neto" to "subtotal".
- Map "IVA contabilizado" to "impuestos".
- Map "Importe total" to "total".
- Map "Estado de pago" to "estado".
- Map "Moneda" to "moneda".

Ignore other columns. Parse all dates to YYYY-MM-DD format. Parse all monetary values to numbers.

Here is the CSV content:
{{{csvContent}}}

Process every row and return the structured JSON array.`,
});

const processCsvInvoicesFlow = ai.defineFlow(
  {
    name: 'processCsvInvoicesFlow',
    inputSchema: ProcessCsvInvoicesInputSchema,
    outputSchema: ProcessCsvInvoicesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
