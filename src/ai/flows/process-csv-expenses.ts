'use server';

/**
 * @fileOverview A Genkit flow for processing a CSV file of expenses.
 *
 * - processCsvExpenses - A function that accepts CSV content and returns structured expense data.
 * - ProcessCsvExpensesInput - The input type for the function.
 * - ProcessCsvExpensesOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProcessCsvExpensesInputSchema = z.object({
  csvContent: z.string().describe('The full content of the CSV file as a string.'),
});
export type ProcessCsvExpensesInput = z.infer<typeof ProcessCsvExpensesInputSchema>;

const ExpenseSchema = z.object({
    fecha: z.string().describe('La fecha del gasto en formato YYYY-MM-DD.'),
    categoria: z.string().describe('La categoría del gasto.'),
    proveedor: z.string().describe('El nombre del proveedor o tienda.'),
    descripcion: z.string().describe('Una breve descripción del gasto.'),
    importe: z.number().describe('El importe total del gasto.'),
    metodoPago: z.string().describe('El método de pago utilizado.'),
});

const ProcessCsvExpensesOutputSchema = z.object({
  expenses: z.array(ExpenseSchema).describe('Una lista de los gastos procesados desde el CSV.'),
});
export type ProcessCsvExpensesOutput = z.infer<typeof ProcessCsvExpensesOutputSchema>;


export async function processCsvExpenses(input: ProcessCsvExpensesInput): Promise<ProcessCsvExpensesOutput> {
  return processCsvExpensesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processCsvExpensesPrompt',
  input: { schema: ProcessCsvExpensesInputSchema },
  output: { schema: ProcessCsvExpensesOutputSchema },
  prompt: `You are an expert data processor. Your task is to analyze the provided CSV content, which contains multiple expenses, and convert it into a structured JSON format.

The CSV headers are likely to be in Spanish. Common headers might include "Fecha", "Categoría", "Proveedor", "Descripción", "Importe", "Método de pago". Your task is to intelligently map these columns to the required output schema, even if the header names are slightly different.

- Map the date column to "fecha" (in YYYY-MM-DD format).
- Map the category column to "categoria".
- Map the supplier/vendor column to "proveedor".
- Map the description column to "descripcion".
- Map the amount/total column to "importe" (as a number).
- Map the payment method column to "metodoPago".

Here is the CSV content:
{{{csvContent}}}

Process every row and return the structured JSON array.`,
});

const processCsvExpensesFlow = ai.defineFlow(
  {
    name: 'processCsvExpensesFlow',
    inputSchema: ProcessCsvExpensesInputSchema,
    outputSchema: ProcessCsvExpensesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
