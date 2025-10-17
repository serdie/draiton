'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating business ideas based on provided company data.
 *
 * - generateBusinessIdeas - A function that takes company data as input and returns AI-generated suggestions for improving commercialization and product offerings.
 * - GenerateBusinessIdeasInput - The input type for the generateBusinessIdeas function.
 * - GenerateBusinessIdeasOutput - The return type for the generateBusinessideas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBusinessIdeasInputSchema = z.object({
  companyData: z
    .string()
    .describe('Comprehensive data about the company, including its products, services, market position, and past performance.'),
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
      'Una lista de sugerencias para mejorar las estrategias de comercialización y la oferta de productos de la empresa.'
    ),
});
export type GenerateBusinessIdeasOutput = z.infer<typeof GenerateBusinessIdeasOutputSchema>;

export async function generateBusinessIdeas(
  input: GenerateBusinessIdeasInput
): Promise<GenerateBusinessIdeasOutput> {
  return generateBusinessIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBusinessIdeasPrompt',
  input: {schema: GenerateBusinessIdeasInputSchema},
  output: {schema: GenerateBusinessIdeasOutputSchema},
  prompt: `Eres un consultor de negocios experto. Analiza los datos de la empresa proporcionados y genera sugerencias prácticas para mejorar sus estrategias de comercialización y oferta de productos.

Responde siempre en español.

You will be provided with a company profile. Company profile: {{{companyData}}}

Genera una lista de sugerencias con un título y detalles para cada una.`,
});

const generateBusinessIdeasFlow = ai.defineFlow(
  {
    name: 'generateBusinessIdeasFlow',
    inputSchema: GenerateBusinessIdeasInputSchema,
    outputSchema: GenerateBusinessIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
