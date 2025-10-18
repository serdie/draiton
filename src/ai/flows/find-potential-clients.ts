
'use server';

/**
 * @fileOverview A Genkit flow to find potential B2B clients for a business.
 *
 * - findPotentialClients - A function that takes a business profile and returns a list of potential clients.
 * - FindPotentialClientsInput - The input type for the findPotentialClients function.
 * - FindPotentialClientsOutput - The return type for the findPotentialClients function.
 */

import { ai } from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { z } from 'genkit';

const FindPotentialClientsInputSchema = z.object({
  productsAndServices: z.string().describe('A detailed description of the products or services the user offers.'),
  existingClientProfile: z.string().describe('A description of the ideal or existing client profile (e.g., industry, company size, needs).'),
  companyLocation: z.string().describe('The geographical location of the user\'s business to focus the search (city, region).'),
});
export type FindPotentialClientsInput = z.infer<typeof FindPotentialClientsInputSchema>;

const PotentialClientSchema = z.object({
    name: z.string().describe('The name of the potential client company.'),
    profile: z.string().describe('A brief profile of the potential client, including their industry and size.'),
    reasoning: z.string().describe('A clear explanation of why this company is a good potential client.'),
    website: z.string().url().describe('The official website URL of the potential client.'),
});

const FindPotentialClientsOutputSchema = z.object({
  potentialClients: z.array(PotentialClientSchema).describe('A list of potential B2B clients.'),
});
export type FindPotentialClientsOutput = z.infer<typeof FindPotentialClientsOutputSchema>;

export async function findPotentialClients(input: FindPotentialClientsInput): Promise<FindPotentialClientsOutput> {
  return findPotentialClientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findPotentialClientsPrompt',
  input: { schema: FindPotentialClientsInputSchema },
  output: { schema: FindPotentialClientsOutputSchema },
  prompt: `You are an expert business development consultant. Your task is to identify potential B2B clients for a user based on their business profile.

The user's business profile is as follows:
- Products and Services Offered: {{{productsAndServices}}}
- Ideal Client Profile: {{{existingClientProfile}}}
- Location: {{{companyLocation}}}

Based on this information, perform a search to find potential companies that would be a good fit as clients. For each potential client, provide:
1.  **Company Name:** The official name of the company.
2.  **Profile:** A brief description of what the company does and its approximate size or relevance.
3.  **Reasoning:** A short, clear explanation of why they would be a good client for the user.
4.  **Website:** The company's official website.

Focus on providing high-quality, relevant leads. Provide the response in Spanish.`,
});

const findPotentialClientsFlow = ai.defineFlow(
  {
    name: 'findPotentialClientsFlow',
    inputSchema: FindPotentialClientsInputSchema,
    outputSchema: FindPotentialClientsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
