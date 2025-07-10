// 'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-powered website management, allowing users to generate and manage their website, online store, or landing page using AI.
 *
 * - aiPoweredWebManagement - A function that handles the website generation and management process.
 * - AIPoweredWebManagementInput - The input type for the aiPoweredWebManagement function.
 * - AIPoweredWebManagementOutput - The return type for the aiPoweredWebManagement function.
 */

'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredWebManagementInputSchema = z.object({
  businessDescription: z
    .string()
    .describe('A detailed description of the user\u2019s business, including its products, services, and target audience.'),
  websiteType: z
    .enum(['website', 'online store', 'landing page'])
    .describe('The type of website the user wants to create.'),
  designPreferences: z
    .string()
    .describe('The user\u2019s preferences for the website design, including color schemes, layout, and desired aesthetics.'),
  exampleWebsites: z
    .string()
    .describe('Optional: URLs of example websites that the user likes, to guide the AI in generating a suitable design.'),
  additionalFeatures: z
    .string()
    .describe('Any specific features the user wants to include in the website, such as a blog, contact form, or e-commerce functionality.'),
});

export type AIPoweredWebManagementInput = z.infer<typeof AIPoweredWebManagementInputSchema>;

const AIPoweredWebManagementOutputSchema = z.object({
  websiteConcept: z.string().describe('A detailed concept for the website, including its overall design, layout, and key features.'),
  suggestedImprovements: z
    .string()
    .describe('Suggestions for improving the website concept.'),
  sections: z
    .string()
    .describe('Suggested sections for the site to include to maximize utility for the business.'),
});

export type AIPoweredWebManagementOutput = z.infer<typeof AIPoweredWebManagementOutputSchema>;

export async function aiPoweredWebManagement(input: AIPoweredWebManagementInput): Promise<AIPoweredWebManagementOutput> {
  return aiPoweredWebManagementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredWebManagementPrompt',
  input: {schema: AIPoweredWebManagementInputSchema},
  output: {schema: AIPoweredWebManagementOutputSchema},
  prompt: `You are an AI web design assistant, designed to assist users in creating and managing their websites, online stores, or landing pages.

You will take the provided business description, desired website type, design preferences, example websites, and additional features to generate a comprehensive website concept.

Business Description: {{{businessDescription}}}
Website Type: {{{websiteType}}}
Design Preferences: {{{designPreferences}}}
Example Websites: {{{exampleWebsites}}}
Additional Features: {{{additionalFeatures}}}

Based on the information above, develop a detailed website concept, suggest improvements, and suggest sections to include in the site.
`,
});

const aiPoweredWebManagementFlow = ai.defineFlow(
  {
    name: 'aiPoweredWebManagementFlow',
    inputSchema: AIPoweredWebManagementInputSchema,
    outputSchema: AIPoweredWebManagementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
