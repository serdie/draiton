'use server';

/**
 * @fileOverview A Genkit flow to generate email campaign content.
 *
 * - generateEmailCampaign - A function that takes a campaign goal and returns AI-generated subject and body.
 * - GenerateEmailCampaignInput - The input type for the function.
 * - GenerateEmailCampaignOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEmailCampaignInputSchema = z.object({
  campaignGoal: z.string().describe('The main objective of the email campaign (e.g., promote a new product, announce a sale, share news).'),
  targetAudience: z.string().describe('A description of the target audience for this email.'),
  tone: z.string().describe('The desired tone for the email (e.g., professional, friendly, urgent, informative).'),
  keyInfo: z.string().optional().describe('Any specific key information, offers, or links to include in the email.'),
});
export type GenerateEmailCampaignInput = z.infer<typeof GenerateEmailCampaignInputSchema>;


const GenerateEmailCampaignOutputSchema = z.object({
    subject: z.string().describe('A compelling and concise subject line for the email.'),
    body: z.string().describe('The full body content of the email, written in plain text or simple markdown. It should be engaging and aligned with the campaign goal.'),
});
export type GenerateEmailCampaignOutput = z.infer<typeof GenerateEmailCampaignOutputSchema>;

export async function generateEmailCampaign(input: GenerateEmailCampaignInput): Promise<GenerateEmailCampaignOutput> {
  return generateEmailCampaignFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEmailCampaignPrompt',
  input: { schema: GenerateEmailCampaignInputSchema },
  output: { schema: GenerateEmailCampaignOutputSchema },
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
