
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a website and providing improvement suggestions.
 *
 * - analyzeWebsite - A function that takes a URL and returns an analysis.
 * - AnalyzeWebsiteInput - The input type for the function.
 * - AnalyzeWebsiteOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeWebsiteInputSchema = z.object({
  url: z.string().url().describe('The URL of the website to analyze.'),
});
export type AnalyzeWebsiteInput = z.infer<typeof AnalyzeWebsiteInputSchema>;

const ImprovementPointSchema = z.object({
    title: z.string().describe('A short, descriptive title for the improvement point.'),
    suggestion: z.string().describe('A detailed explanation of the issue and a concrete suggestion for improvement.'),
});

const AnalyzeWebsiteOutputSchema = z.object({
    seo: z.object({
        title: z.string().describe('SEO (Optimización para Buscadores)'),
        points: z.array(ImprovementPointSchema).describe('A list of SEO improvement points.'),
    }),
    performance: z.object({
        title: z.string().describe('Rendimiento y Velocidad'),
        points: z.array(ImprovementPointSchema).describe('A list of performance improvement points.'),
    }),
    ux: z.object({
        title: z.string().describe('Experiencia de Usuario (UX) y Diseño'),
        points: z.array(ImprovementPointSchema).describe('A list of UX and design improvement points.'),
    }),
    security: z.object({
        title: z.string().describe('Seguridad'),
        points: z.array(ImprovementPointSchema).describe('A list of security improvement points.'),
    })
});

export type AnalyzeWebsiteOutput = z.infer<typeof AnalyzeWebsiteOutputSchema>;

export async function analyzeWebsite(input: AnalyzeWebsiteInput): Promise<AnalyzeWebsiteOutput> {
  return analyzeWebsiteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeWebsitePrompt',
  input: {schema: AnalyzeWebsiteInputSchema},
  output: {schema: AnalyzeWebsiteOutputSchema},
  prompt: `You are a world-class web development and digital marketing consultant. Your task is to analyze the provided website URL and generate a structured report with actionable improvement points. Respond ALWAYS in Spanish.

Website to analyze: {{{url}}}

Please provide a detailed analysis covering the following four key areas:
1.  **SEO (Search Engine Optimization):** Analyze on-page SEO factors. Look for issues with titles, meta descriptions, headings, keyword usage, and mobile-friendliness.
2.  **Performance and Speed:** Identify potential performance bottlenecks. Suggest improvements related to image optimization, code minification, caching, and server response time.
3.  **UX and Design:** Evaluate the user experience and design. Comment on navigation clarity, call-to-action effectiveness, visual hierarchy, and overall aesthetic.
4.  **Security:** Point out potential security vulnerabilities. Suggest best practices like using HTTPS, secure headers, and keeping software up-to-date.

For each area, provide a list of specific, actionable improvement points. Each point should have a clear title and a detailed suggestion. Be concise but thorough.`,
});

const analyzeWebsiteFlow = ai.defineFlow(
  {
    name: 'analyzeWebsiteFlow',
    inputSchema: AnalyzeWebsiteInputSchema,
    outputSchema: AnalyzeWebsiteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
