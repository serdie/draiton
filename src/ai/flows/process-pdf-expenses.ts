
'use server';

/**
 * @fileOverview A Genkit flow for processing a PDF file of expenses.
 *
 * - processPdfExpenses - A function that accepts a PDF file and returns structured expense data.
 * - ProcessPdfExpensesInput - The input type for the function.
 * - ProcessPdfExpensesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { z } from 'genkit';

const ProcessPdfExpensesInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF document of expenses, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'"
    ),
});
export type ProcessPdfExpensesInput = z.infer<typeof ProcessPdfExpensesInputSchema>;

const ExpenseSchema = z.object({
    fecha: z.string().describe('La fecha del gasto en formato YYYY-MM-DD.'),
    categoria: z.string().describe('La categoría del gasto (Software, Oficina, Marketing, Viajes, Suministros, Otros).'),
    proveedor: z.string().describe('El nombre del proveedor o tienda.'),
    descripcion: z.string().describe('Una breve descripción del gasto.'),
    importe: z.number().describe('El importe total del gasto.'),
    metodoPago: z.string().describe('El método de pago utilizado (Tarjeta, Efectivo, Transferencia...).'),
});

const ProcessPdfExpensesOutputSchema = z.object({
  expenses: z.array(ExpenseSchema).describe('Una lista de los gastos procesados desde el PDF.'),
});
export type ProcessPdfExpensesOutput = z.infer<typeof ProcessPdfExpensesOutputSchema>;


export async function processPdfExpenses(input: ProcessPdfExpensesInput): Promise<ProcessPdfExpensesOutput> {
  return processPdfExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processPdfExpensesPrompt',
  input: { schema: ProcessPdfExpensesInputSchema },
  output: { schema: ProcessPdfExpensesOutputSchema },
  prompt: `You are an expert data processor. Your task is to analyze the provided PDF document, which contains multiple expenses (like a bank statement or credit card summary), and convert each transaction into a structured JSON format.

The user has provided a PDF file. Identify every single expense transaction in the document. For each transaction, extract the following information:

- **fecha**: The date of the expense. Convert it to YYYY-MM-DD format.
- **proveedor**: The name of the merchant or supplier.
- **descripcion**: A brief description of what was purchased. If not available, use the supplier name.
- **importe**: The total amount of the expense, as a number.
- **categoria**: Infer a relevant category from this list: Software, Oficina, Marketing, Viajes, Suministros, Otros.
- **metodoPago**: Infer the payment method, usually "Tarjeta" or "Transferencia".

Here is the PDF document:
{{media url=pdfDataUri}}

Process every transaction you can find in the document and return a structured JSON array of all expenses.`,
});

const processPdfExpensesFlow = ai.defineFlow(
  {
    name: 'processPdfExpensesFlow',
    inputSchema: ProcessPdfExpensesInputSchema,
    outputSchema: ProcessPdfExpensesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
