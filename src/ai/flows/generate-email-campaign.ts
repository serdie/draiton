'use server';

/**
 * @fileOverview A Genkit flow to generate email campaign content.
 *
 * - generateEmailCampaign - A function that takes a campaign goal and returns AI-generated subject and body.
 * - GenerateEmailCampaignInput - The input type for the function.
 * - GenerateEmailCampaignOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {
  GenerateEmailCampaignInputSchema,
  GenerateEmailCampaignOutputSchema,
  type GenerateEmailCampaignInput,
  type GenerateEmailCampaignOutput,
} from '@/app/dashboard/marketing/campanas/crear/schemas';
import { googleAI } from '@genkit-ai/googleai';

export async function generateEmailCampaign(input: GenerateEmailCampaignInput): Promise<GenerateEmailCampaignOutput> {
  return generateEmailCampaignFlow(input);
}

const generateEmailCampaignFlow = ai.defineFlow(
  {
    name: 'generateEmailCampaignFlow',
    inputSchema: GenerateEmailCampaignInputSchema,
    outputSchema: GenerateEmailCampaignOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: `Eres un experto en email marketing. Tu tarea es escribir un correo electrónico convincente basado en los siguientes objetivos.

**Objetivo de la Campaña:** ${input.campaignGoal}
**Público Objetivo:** ${input.targetAudience}
**Tono deseado:** ${input.tone}
**Información Clave a Incluir:** ${input.keyInfo}

Basado en esto, genera un asunto (subject) y un cuerpo (body) para el correo. El cuerpo debe ser claro, persuasivo y terminar con una llamada a la acción clara. Escribe el correo en español.`,
      output: {
        schema: GenerateEmailCampaignOutputSchema,
      },
    });
    return output!;
  }
);
