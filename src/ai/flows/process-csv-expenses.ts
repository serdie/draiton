'use server';

/**
 * @fileOverview Flujo de Genkit para procesar un archivo CSV de gastos.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Descripciones en español) ---

const ProcessCsvExpensesInputSchema = z.object({
  csvContent: z.string().describe('El contenido completo del archivo CSV como texto.'),
});
export type ProcessCsvExpensesInput = z.infer<typeof ProcessCsvExpensesInputSchema>;

const ExpenseSchema = z.object({
  fecha: z.string().describe('La fecha del gasto en formato AAAA-MM-DD.'),
  categoria: z.string().describe('La categoría del gasto.'),
  proveedor: z.string().describe('El nombre del proveedor o tienda.'),
  descripcion: z.string().describe('Una breve descripción del gasto.'),
  importe: z.number().describe('El importe total del gasto (numérico).'),
  metodoPago: z.string().describe('El método de pago utilizado.'),
});

const ProcessCsvExpensesOutputSchema = z.object({
  expenses: z.array(ExpenseSchema).describe('Lista de los gastos procesados desde el CSV.'),
});
export type ProcessCsvExpensesOutput = z.infer<typeof ProcessCsvExpensesOutputSchema>;

export async function processCsvExpenses(input: ProcessCsvExpensesInput): Promise<ProcessCsvExpensesOutput> {
  return processCsvExpensesFlow(input);
}

// --- PROMPT (Instrucciones en español, el modelo se añade en el flow) ---
const prompt = ai.definePrompt({
  name: 'processCsvExpensesPrompt',
  input: { schema: ProcessCsvExpensesInputSchema },
  output: { schema: ProcessCsvExpensesOutputSchema },
  prompt: `Eres un experto procesador de datos. Tu tarea es analizar el contenido CSV proporcionado, que contiene múltiples gastos, y convertirlo a un formato JSON estructurado.

Las cabeceras del CSV probablemente estarán en español. Cabeceras comunes podrían ser "Fecha", "Categoría", "Proveedor", "Descripción", "Importe", "Método de pago". Tu tarea es mapear inteligentemente estas columnas al esquema de salida requerido, incluso si los nombres de las cabeceras varían ligeramente.

- Mapea la columna de fecha a "fecha" (en formato AAAA-MM-DD).
- Mapea la columna de categoría a "categoria".
- Mapea la columna de proveedor/vendedor a "proveedor".
- Mapea la columna de descripción a "descripcion".
- Mapea la columna de importe/total a "importe" (como número).
- Mapea la columna de método de pago a "metodoPago".

Aquí está el contenido del CSV:
{{{csvContent}}}

Procesa cada fila y devuelve el array JSON estructurado ('expenses'). Responde ÚNICAMENTE con el JSON.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const processCsvExpensesFlow = ai.defineFlow(
  {
    name: 'processCsvExpensesFlow',
    inputSchema: ProcessCsvExpensesInputSchema,
    outputSchema: ProcessCsvExpensesOutputSchema,
  },
  async (input: ProcessCsvExpensesInput) => { // Añadimos tipo a input
    try {
      // 1. Llamamos al prompt especificando el modelo
      const { output } = await prompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'), // Modelo añadido aquí
      });

      // 2. Validamos la salida con safeParse
      const parsed = ProcessCsvExpensesOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de Zod en processCsvExpenses:', parsed.error);
        throw new Error('La IA ha devuelto la lista de gastos con formato inesperado.');
      }
      
      return parsed.data; // Devolvemos los datos validados

    } catch (error) {
      // 3. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en processCsvExpensesFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudieron procesar los gastos del CSV. Error: ${message}`);
    }
  }
);
