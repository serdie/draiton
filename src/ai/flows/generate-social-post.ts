'use server';

/**
 * @fileOverview Flujo de Genkit para generar publicaciones para redes sociales.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Descripciones en español) ---

const GenerateSocialPostInputSchema = z.object({
  targetAudience: z.string().describe('Descripción del público al que se dirige la publicación.'),
  platform: z.enum(['Facebook', 'Instagram', 'Twitter', 'LinkedIn']).describe('La plataforma de red social objetivo.'),
  campaignObjective: z.string().describe('El objetivo de la campaña (ej. aumentar interacción, promocionar producto, generar leads).'),
  keyInformation: z.string().describe('Información clave o mensaje principal que debe contener la publicación.'),
  tone: z.string().describe('Tono deseado para la publicación (ej. "formal", "divertido", "inspirador").'),
});
export type GenerateSocialPostInput = z.infer<typeof GenerateSocialPostInputSchema>;

const GenerateSocialPostOutputSchema = z.object({
  postContent: z.string().describe('El texto completo de la publicación para la red social.'),
  hashtags: z.array(z.string()).describe('Una lista de hashtags relevantes para la publicación.'),
  callToAction: z.string().describe('Una llamada a la acción clara para el usuario (ej. "Visita nuestro perfil", "Compra ahora").'),
});
export type GenerateSocialPostOutput = z.infer<typeof GenerateSocialPostOutputSchema>;

export async function generateSocialPost(input: GenerateSocialPostInput): Promise<GenerateSocialPostOutput> {
  return generateSocialPostFlow(input);
}

// --- PROMPT (Instrucciones en español, el modelo se añade en el flow) ---
const prompt = ai.definePrompt({
  name: 'generateSocialPostPrompt',
  input: { schema: GenerateSocialPostInputSchema },
  output: { schema: GenerateSocialPostOutputSchema },
  prompt: `Eres un experto en marketing digital y creación de contenido para redes sociales. Tu tarea es generar una publicación atractiva y efectiva para la plataforma especificada.

**Público Objetivo:** {{{targetAudience}}}
**Plataforma:** {{{platform}}}
**Objetivo de la Campaña:** {{{campaignObjective}}}
**Información Clave a Incluir:** {{{keyInformation}}}
**Tono Deseado:** {{{tone}}}

Genera el 'postContent' (el texto principal de la publicación), una lista de 'hashtags' relevantes y una 'callToAction' clara. El contenido debe ser adecuado para la plataforma, captar la atención del público objetivo y cumplir el objetivo de la campaña. Responde SIEMPRE en español y ÚNICAMENTE con el formato JSON requerido.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const generateSocialPostFlow = ai.defineFlow(
  {
    name: 'generateSocialPostFlow',
    inputSchema: GenerateSocialPostInputSchema,
    outputSchema: GenerateSocialPostOutputSchema,
  },
  async (input: GenerateSocialPostInput) => { // Añadimos tipo a input
    try {
      // 1. Llamamos al prompt especificando el modelo
      const { output } = await prompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'), // Modelo añadido aquí
      });

      // 2. Validamos la salida con safeParse
      const parsed = GenerateSocialPostOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de Zod en generateSocialPost:', parsed.error);
        throw new Error('La IA ha devuelto la publicación con formato inesperado.');
      }
      
      return parsed.data; // Devolvemos los datos validados

    } catch (error) {
      // 3. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en generateSocialPostFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudo generar la publicación social. Error: ${message}`);
    }
  }
);
