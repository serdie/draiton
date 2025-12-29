'use server';

/**
 * @fileOverview Flujo de Genkit para procesar un archivo PDF de gastos.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Descripciones en español) ---

const ProcessPdfExpensesInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "Un documento PDF de gastos (ej. extracto bancario), como data URI (Base64 con MIME type 'application/pdf'). Formato: 'data:application/pdf;base64,<encoded_data>'"
    ),
});
export type ProcessPdfExpensesInput = z.infer<typeof ProcessPdfExpensesInputSchema>;

// Ajustamos descripciones a español
const ExpenseSchema = z.object({
  fecha: z.string().describe('La fecha del gasto en formato AAAA-MM-DD.'),
  categoria: z.string().describe('Categoría del gasto (Software, Oficina, Marketing, Viajes, Suministros, Otros).'),
  proveedor: z.string().describe('El nombre del proveedor o tienda.'),
  descripcion: z.string().describe('Una breve descripción del gasto.'),
  importe: z.number().describe('El importe total del gasto (numérico).'),
  metodoPago: z.string().describe('El método de pago utilizado (Tarjeta, Transferencia, Efectivo...).'),
});

const ProcessPdfExpensesOutputSchema = z.object({
  expenses: z.array(ExpenseSchema).describe('Lista de los gastos procesados desde el PDF.'),
});
export type ProcessPdfExpensesOutput = z.infer<typeof ProcessPdfExpensesOutputSchema>;

export async function processPdfExpenses(input: ProcessPdfExpensesInput): Promise<ProcessPdfExpensesOutput> {
  return processPdfExpensesFlow(input);
}

// --- PROMPT (Instrucciones en español, el modelo se añade en el flow) ---
const prompt = ai.definePrompt({
  name: 'processPdfExpensesPrompt',
  input: { schema: ProcessPdfExpensesInputSchema },
  output: { schema: ProcessPdfExpensesOutputSchema },
  prompt: `Eres un experto procesador de datos. Tu tarea es analizar el documento PDF proporcionado, que contiene múltiples gastos (como un extracto bancario o resumen de tarjeta), y convertir cada transacción en un formato JSON estructurado.

El usuario ha proporcionado un archivo PDF. Identifica cada transacción de gasto individual en el documento. Para cada transacción, extrae la siguiente información:

-   **fecha**: La fecha del gasto. Conviértela al formato AAAA-MM-DD.
-   **proveedor**: El nombre del comercio o proveedor.
-   **descripcion**: Una breve descripción de lo comprado. Si no está disponible, usa el nombre del proveedor.
-   **importe**: El importe total del gasto, como número.
-   **categoria**: Infiere una categoría relevante de esta lista: Software, Oficina, Marketing, Viajes, Suministros, Otros.
-   **metodoPago**: Infiere el método de pago, normalmente "Tarjeta" o "Transferencia".

Aquí está el documento PDF:
{{media url=pdfDataUri}}

Procesa cada transacción que encuentres en el documento y devuelve un array JSON estructurado ('expenses') con todos los gastos. Responde ÚNICAMENTE con el JSON.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const processPdfExpensesFlow = ai.defineFlow(
  {
    name: 'processPdfExpensesFlow',
    inputSchema: ProcessPdfExpensesInputSchema,
    outputSchema: ProcessPdfExpensesOutputSchema,
  },
  async (input: ProcessPdfExpensesInput) => { // Añadimos tipo a input
    try {
      // 1. Llamamos al prompt especificando el modelo
      const { output } = await prompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'), // Modelo añadido aquí
      });

      // 2. Validamos la salida con safeParse
      const parsed = ProcessPdfExpensesOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de Zod en processPdfExpenses:', parsed.error);
        throw new Error('La IA ha devuelto la lista de gastos del PDF con formato inesperado.');
      }
      
      return parsed.data; // Devolvemos los datos validados

    } catch (error) {
      // 3. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en processPdfExpensesFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudieron procesar los gastos del PDF. Error: ${message}`);
    }
  }
);
