'use server';

/**
 * @fileOverview Flujo de Genkit para generar una imagen para una publicación de blog o redes sociales.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Descripciones en español) ---

const GenerateImageForPostInputSchema = z.object({
  postContent: z.string().describe('El contenido completo de la publicación (blog, red social) para la que se necesita la imagen.'),
  stylePreferences: z.string().optional().describe('Preferencias de estilo para la imagen (ej. "minimalista", "vintage", "futurista", "fotorealista").'),
  aspectRatio: z.enum(['16:9', '1:1', '4:3', '9:16']).optional().describe('Relación de aspecto deseada para la imagen (ej. "16:9" para horizontal, "1:1" para cuadrado).'),
});
export type GenerateImageForPostInput = z.infer<typeof GenerateImageForPostInputSchema>;

const GenerateImageForPostOutputSchema = z.object({
  imagePrompt: z.string().describe('Un prompt detallado para un generador de imágenes de IA que capte la esencia del contenido.'),
});
export type GenerateImageForPostOutput = z.infer<typeof GenerateImageForPostOutputSchema>;

export async function generateImageForPost(input: GenerateImageForPostInput): Promise<GenerateImageForPostOutput> {
  return generateImageForPostFlow(input);
}

// --- PROMPT (Instrucciones en español, el modelo se añade en el flow) ---
const prompt = ai.definePrompt({
  name: 'generateImageForPostPrompt',
  input: { schema: GenerateImageForPostInputSchema },
  output: { schema: GenerateImageForPostOutputSchema },
  prompt: `Eres un director de arte experto en prompts para IA de generación de imágenes. Tu tarea es crear un prompt de imagen detallado y creativo para la siguiente publicación.

**Contenido de la Publicación:**
{{{postContent}}}

**Preferencias de Estilo (Opcional):**
{{{stylePreferences}}}

**Relación de Aspecto (Opcional):**
{{{aspectRatio}}}

**Tu Objetivo:**
Genera un 'imagePrompt' que describa vívidamente la escena o el concepto visual que mejor represente el contenido de la publicación, teniendo en cuenta las preferencias de estilo y relación de aspecto. El prompt debe ser lo suficientemente detallado como para guiar a una IA generativa (como Midjourney o DALL-E) a crear una imagen relevante y de alta calidad.

Responde ÚNICAMENTE con el formato JSON requerido.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const generateImageForPostFlow = ai.defineFlow(
  {
    name: 'generateImageForPostFlow',
    inputSchema: GenerateImageForPostInputSchema,
    outputSchema: GenerateImageForPostOutputSchema,
  },
  async (input: GenerateImageForPostInput) => { // Añadimos tipo a input
    try {
      // 1. Llamamos al prompt especificando el modelo
      const { output } = await prompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'), // Modelo añadido aquí
      });

      // 2. Validamos la salida con safeParse
      const parsed = GenerateImageForPostOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de Zod en generateImageForPost:', parsed.error);
        throw new Error('La IA ha devuelto el prompt de imagen con formato inesperado.');
      }
      
      return parsed.data; // Devolvemos los datos validados

    } catch (error) {
      // 3. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en generateImageForPostFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudo generar el prompt de imagen. Error: ${message}`);
    }
  }
);
