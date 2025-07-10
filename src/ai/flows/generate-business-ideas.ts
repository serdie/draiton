'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating business ideas based on provided company data.
 *
 * - generateBusinessIdeas - A function that takes company data as input and returns AI-generated suggestions for improving commercialization and product offerings.
 * - GenerateBusinessIdeasInput - The input type for the generateBusinessIdeas function.
 * - GenerateBusinessIdeasOutput - The return type for the generateBusinessIdeas function.
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
    .string()
    .describe(
      'AI-generated suggestions for improving the company’s commercialization strategies and product offerings.'
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
  prompt: `You are an expert business consultant. Analyze the provided company data and generate actionable suggestions for improving their commercialization strategies and product offerings.

Company Data: {{{companyData}}}

Suggestions:`, // Make sure to include "Suggestions:" to prompt for the suggestions directly
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
