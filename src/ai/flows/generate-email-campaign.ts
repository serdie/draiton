
'use server';

/**
 * @fileOverview A Genkit flow to generate email campaign content.
 *
 * - generateEmailCampaign - A function that takes a campaign goal and returns AI-generated subject and body.
 * - GenerateEmailCampaignInput - The input type for the function.
 * - GenerateEmailCampaignOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { GenerateEmailCampaignInputSchema, GenerateEmailCampaignOutputSchema, type GenerateEmailCampaignInput, type GenerateEmailCampaignOutput } from '@/ai/schemas/email-campaign-schemas';


export async function generateEmailCampaign(input: GenerateEmailCampaignInput): Promise<GenerateEmailCampaignOutput> {
  return generateEmailCampaignFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateEmailCampaignPrompt',
  input: { schema: GenerateEmailCampaignInputSchema },
  output: { schema: GenerateEmailCampaignOutputSchema },
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `Eres un experto en email marketing. Tu tarea es escribir un correo electrónico convincente basado en los siguientes objetivos.

**Objetivo de la Campaña:** {{{campaignGoal}}}
**Público Objetivo:** {{{targetAudience}}}
**Tono deseado:** {{{tone}}}
**Información Clave a Incluir:** {{{keyInfo}}}

Basado en esto, genera un asunto (subject) y un cuerpo (body) para el correo. El cuerpo debe ser claro, persuasivo y terminar con una llamada a la acción clara. Escribe el correo en español.`,
});


const generateEmailCampaignFlow = ai.defineFlow(
  {
    name: 'generateEmailCampaignFlow',
    inputSchema: GenerateEmailCampaignInputSchema,
    outputSchema: GenerateEmailCampaignOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
