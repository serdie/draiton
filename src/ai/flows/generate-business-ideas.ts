'use server';

/**
 * @fileOverview Flujo de Genkit para generar ideas de negocio basadas en datos de una empresa.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Descripciones en español) ---

const GenerateBusinessIdeasInputSchema = z.object({
  companyData: z
    .string()
    .describe('Datos completos sobre la empresa: productos, servicios, mercado, rendimiento pasado, etc.'),
});
export type GenerateBusinessIdeasInput = z.infer<typeof GenerateBusinessIdeasInputSchema>;

const GenerateBusinessIdeasOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        title: z.string().describe('Un título conciso para la sugerencia.'),
        details: z
          .string()
          .describe('Una descripción detallada de la sugerencia.'),
      })
    )
    .describe(
      "Lista de sugerencias para mejorar las estrategias de marketing y la oferta de productos de la empresa."
    ),
});
export type GenerateBusinessIdeasOutput = z.infer<typeof GenerateBusinessIdeasOutputSchema>;

export async function generateBusinessIdeas(
  input: GenerateBusinessIdeasInput
): Promise<GenerateBusinessIdeasOutput> {
  return generateBusinessIdeasFlow(input);
}

// --- PROMPT (Instrucciones en español, el modelo se añade en el flow) ---
const prompt = ai.definePrompt({
  name: 'generateBusinessIdeasPrompt',
  input: { schema: GenerateBusinessIdeasInputSchema },
  output: { schema: GenerateBusinessIdeasOutputSchema },
  prompt: `Eres un consultor de negocios experto. Analiza los datos de la empresa proporcionados y genera sugerencias prácticas para mejorar sus estrategias de comercialización y oferta de productos. Responde siempre en español.

Datos de la empresa:
{{{ companyData }}}

Genera una lista de sugerencias, cada una con un título ('title') y detalles ('details'). Responde ÚNICAMENTE con el formato JSON requerido.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const generateBusinessIdeasFlow = ai.defineFlow(
  {
    name: 'generateBusinessIdeasFlow',
    inputSchema: GenerateBusinessIdeasInputSchema,
    outputSchema: GenerateBusinessIdeasOutputSchema,
  },
  async (input: GenerateBusinessIdeasInput) => { // Añadimos tipo a input
    try {
      // 1. Llamamos al prompt especificando el modelo
      const { output } = await prompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'), // Modelo añadido aquí
      });

      // 2. Validamos la salida con safeParse
      const parsed = GenerateBusinessIdeasOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de Zod en generateBusinessIdeas:', parsed.error);
        throw new Error('La IA ha devuelto sugerencias con formato inesperado.');
      }
      
      return parsed.data; // Devolvemos los datos validados

    } catch (error) {
      // 3. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en generateBusinessIdeasFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudieron generar las ideas de negocio. Error: ${message}`);
    }
  }
);
