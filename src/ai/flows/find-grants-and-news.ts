'use server';

/**
 * @fileOverview A Genkit flow to find relevant grants and news for a business.
 *
 * - findGrantsAndNews - A function that takes a business profile and returns relevant grants and news.
 * - FindGrantsAndNewsInput - The input type for the findGrantsAndNews function.
 * - FindGrantsAndNewsOutput - The return type for the findGrantsAndNews function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindGrantsAndNewsInputSchema = z.object({
  businessSector: z.string().describe('The economic sector of the business (e.g., hospitality, technology, retail).'),
  businessLocation: z.string().describe('The location of the business (City and/or Autonomous Community in Spain).'),
  employeeCount: z.number().describe('The number of employees in the business.'),
  businessDescription: z.string().describe('A brief description of the business and its activities.'),
});
export type FindGrantsAndNewsInput = z.infer<typeof FindGrantsAndNewsInputSchema>;

const GrantOrNewsSchema = z.object({
    title: z.string().describe('The concise and clear title of the grant or news article.'),
    summary: z.string().describe('A brief summary explaining why this is relevant to the business.'),
    sourceLink: z.string().url().describe('The direct URL to the source of the information.'),
});

const FindGrantsAndNewsOutputSchema = z.object({
  grants: z.array(GrantOrNewsSchema).describe('A list of relevant grants, subsidies, or public aid.'),
  news: z.array(GrantOrNewsSchema).describe('A list of relevant business or economic news articles.'),
});
export type FindGrantsAndNewsOutput = z.infer<typeof FindGrantsAndNewsOutputSchema>;

export async function findGrantsAndNews(input: FindGrantsAndNewsInput): Promise<FindGrantsAndNewsOutput> {
  return findGrantsAndNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findGrantsAndNewsPrompt',
  input: { schema: FindGrantsAndNewsInputSchema },
  output: { schema: FindGrantsAndNewsOutputSchema },
  prompt: `You are an expert business consultant specializing in the Spanish market. Your task is to find the most relevant and up-to-date grants, subsidies, and economic news for a specific business profile.

The user's business profile is as follows:
- Sector: {{{businessSector}}}
- Location: {{{businessLocation}}}
- Number of Employees: {{{employeeCount}}}
- Description: {{{businessDescription}}}

Please perform a search and provide a curated list of:
1.  **Grants/Subsidies:** Look for national, regional, or local public aid that this type of business could apply for.
2.  **News:** Find recent economic or business news that could impact or be of interest to this business (e.g., new regulations, market trends, tax changes).

For each item, provide a clear title, a short summary explaining its relevance, and a direct link to the official source or news article. Focus on information from the last 6 months to ensure relevance. Respond ONLY in Spanish.`,
});

const findGrantsAndNewsFlow = ai.defineFlow(
  {
    name: 'findGrantsAndNewsFlow',
    inputSchema: FindGrantsAndNewsInputSchema,
    outputSchema: FindGrantsAndNewsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
