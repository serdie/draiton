
'use server';

/**
 * @fileOverview A Genkit flow to generate social media post content.
 *
 * - generateSocialPost - A function that takes a post goal and returns AI-generated text.
 * - GenerateSocialPostInput - The input type for the function.
 * - GenerateSocialPostOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateSocialPostInputSchema = z.object({
  objective: z.string().describe('The main goal of the social media post (e.g., promote a new product, share a company update, post a tutorial).'),
  format: z.string().describe('The format for the post (e.g., "Instagram Post", "LinkedIn Article", "Twitter Thread").'),
  tone: z.string().describe('The desired tone for the post (e.g., professional, funny, inspiring, informative).'),
  keyInfo: z.string().optional().describe('Any specific key information, links, or hashtags to include.'),
});
export type GenerateSocialPostInput = z.infer<typeof GenerateSocialPostInputSchema>;


const GenerateSocialPostOutputSchema = z.object({
    postText: z.string().describe('The full body content of the social media post, including relevant hashtags and calls to action.'),
});
export type GenerateSocialPostOutput = z.infer<typeof GenerateSocialPostOutputSchema>;

export async function generateSocialPost(input: GenerateSocialPostInput): Promise<GenerateSocialPostOutput> {
  return generateSocialPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSocialPostPrompt',
  input: { schema: GenerateSocialPostInputSchema },
  output: { schema: GenerateSocialPostOutputSchema },
  prompt: `Eres un community manager experto en crear contenido viral y efectivo para redes sociales. Tu tarea es escribir un post para redes sociales basado en los siguientes objetivos.

**Objetivo del Post:** {{{objective}}}
**Formato del Post:** {{{format}}}
**Tono Deseado:** {{{tone}}}
**Información Clave a Incluir (Opcional):** {{{keyInfo}}}

Basado en esto, genera el texto completo para la publicación. Asegúrate de que sea atractivo, se adapte a la plataforma (formato), y termine con una llamada a la acción clara si es apropiado. Incluye 2-3 hashtags relevantes. Escribe el post en español.`,
});

const generateSocialPostFlow = ai.defineFlow(
  {
    name: 'generateSocialPostFlow',
    inputSchema: GenerateSocialPostInputSchema,
    outputSchema: GenerateSocialPostOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
