'use server';

/**
 * @fileOverview Flujo de Genkit para extraer datos de una imagen de ticket o recibo.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Descripciones en español) ---

const ExtractReceiptDataInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "Una foto de un ticket o recibo, como data URI (Base64 con MIME type). Formato esperado: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractReceiptDataInput = z.infer<typeof ExtractReceiptDataInputSchema>;

// Ajustamos descripciones a español
const ExtractReceiptDataOutputSchema = z.object({
  supplier: z.string().describe('El nombre del proveedor o tienda.'),
  date: z.string().describe('La fecha del gasto en formato AAAA-MM-DD.'),
  totalAmount: z.number().describe('El importe total del gasto.'),
  taxAmount: z.number().optional().describe('El importe del impuesto (IVA, opcional).'),
  category: z
    .enum(['Software', 'Oficina', 'Marketing', 'Viajes', 'Suministros', 'Otros'])
    .describe('Categoría sugerida para el gasto.'),
  description: z
    .string()
    .describe('Breve descripción de los artículos o servicios comprados.'),
});
export type ExtractReceiptDataOutput = z.infer<typeof ExtractReceiptDataOutputSchema>;

export async function extractReceiptData(input: ExtractReceiptDataInput): Promise<ExtractReceiptDataOutput> {
  return extractReceiptDataFlow(input);
}

// --- PROMPT (Instrucciones en español, petición de JSON) ---
const extractReceiptDataPrompt = ai.definePrompt({
  name: 'extractReceiptDataPrompt',
  input: { schema: ExtractReceiptDataInputSchema },
  output: { schema: ExtractReceiptDataOutputSchema },
  prompt: `Eres un asistente experto de IA especializado en extraer datos de tickets y recibos españoles.

Recibirás una imagen de un ticket. Tu tarea es extraer la siguiente información:
-   **supplier**: El nombre de la tienda o proveedor.
-   **date**: La fecha de la transacción. Devuelve en formato AAAA-MM-DD.
-   **totalAmount**: El importe final total pagado.
-   **taxAmount**: El valor de los impuestos (como IVA). Si no se encuentra explícitamente, puedes dejarlo vacío.
-   **category**: Infiere una categoría relevante de las siguientes opciones: Software, Oficina, Marketing, Viajes, Suministros, Otros.
-   **description**: Crea un breve resumen de los artículos o servicios comprados.

Aquí está la imagen del ticket: {{media url=receiptDataUri}}

Extrae los datos y responde ÚNICAMENTE con el formato JSON requerido.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const extractReceiptDataFlow = ai.defineFlow(
  {
    name: 'extractReceiptDataFlow',
    inputSchema: ExtractReceiptDataInputSchema,
    outputSchema: ExtractReceiptDataOutputSchema,
  },
  async (input: ExtractReceiptDataInput) => {
    try {
      // 1. Llamamos al prompt correcto y especificamos el modelo
      const { output } = await extractReceiptDataPrompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'),
      });

      // 2. Validamos la salida con safeParse
      const parsed = ExtractReceiptDataOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de validación de Zod en extractReceiptData:', parsed.error);
        throw new Error('La IA devolvió los datos del ticket en un formato inesperado.');
      }
      
      return parsed.data; // Devolvemos datos validados

    } catch (error) {
      // 3. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en extractReceiptDataFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudieron extraer los datos del ticket. Error: ${message}`);
    }
  }
);
