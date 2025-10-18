'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a website and providing improvement suggestions.
 *
 * - analyzeWebsite - A function that takes a URL and returns an analysis.
 * - AnalyzeWebsiteInput - The input type for the function.
 * - AnalyzeWebsiteOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit'; // Solo necesitamos 'z'

// --- ESQUEMAS DE ENTRADA Y SALIDA (SIN CAMBIOS) ---

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
  }),
});

export type AnalyzeWebsiteOutput = z.infer<typeof AnalyzeWebsiteOutputSchema>;

export async function analyzeWebsite(input: AnalyzeWebsiteInput): Promise<AnalyzeWebsiteOutput> {
  return analyzeWebsiteFlow(input);
}

// --- NUEVA HERRAMIENTA (AHORA ES UNA FUNCIÓN NORMAL) ---
// No necesitamos 'defineTool' ni 'z.fn'. Es solo una función helper.

async function browseWebsite(input: { url: string }): Promise<{ content: string }> {
  try {
    const response = await fetch(input.url);
    if (!response.ok) {
      throw new Error(`Error al acceder a la URL: ${response.statusText}`);
    }
    const text = await response.text();
    // Simplificamos el HTML
    const simplifiedText = text
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '') // Quita CSS
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '') // Quita JS
      .replace(/(\r\n|\n|\r)/gm, ' ') // Quita saltos de línea
      .replace(/\s+/g, ' ') // Quita espacios extra
      .substring(0, 100000); // Limita a 100k caracteres

    return { content: simplifiedText };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: `Error: No se pudo acceder a la página. ${message}` };
  }
}

// --- FLUJO CORREGIDO (USA LA FUNCIÓN NORMAL) ---

const analyzeWebsiteFlow = ai.defineFlow(
  {
    name: 'analyzeWebsiteFlow',
    inputSchema: AnalyzeWebsiteInputSchema,
    outputSchema: AnalyzeWebsiteOutputSchema,
    // No necesitamos 'tools' aquí
  },
  async (input: AnalyzeWebsiteInput) => {
    
    // PASO 1: Llamamos a nuestra función 'helper' normal
    console.log(`Navegando a: ${input.url}`);
    const { content: pageContent } = await browseWebsite(input);

    if (pageContent.startsWith('Error:')) {
      throw new Error(pageContent);
    }

    // PASO 2: Creamos el prompt con el contenido real de la página
    const prompt = `You are a world-class web development and digital marketing consultant. Your task is to analyze the provided website's HTML content and generate a structured report with actionable improvement points. Respond ALWAYS in Spanish.

Website to analyze: ${input.url}

HTML Content of the website:
"""
${pageContent}
"""

Based on this HTML, provide a detailed analysis covering the following four key areas:
1.  **SEO (Search Engine Optimization):** Analyze on-page SEO factors from the HTML. Look for issues with titles, meta descriptions, headings (h1, h2, h3), and alt text in images.
2.  **Performance and Speed:** Identify potential performance bottlenecks obvious from the HTML (e.g., large inline scripts, many CSS files).
3.  **UX and Design:** Evaluate the user experience from the structure (e.g., clear navigation, logical structure).
4.  **Security:** Point out potential security vulnerabilities (e.g., links a http en lugar de https).

For each area, provide a list of specific, actionable improvement points. Each point should have a clear title and a detailed suggestion. Be concise but thorough.`;
    
    // PASO 3: Llamamos a la IA
    const llmResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'),
        prompt: prompt,
        output: { schema: AnalyzeWebsiteOutputSchema },
    });
    
    // Aplicamos la mejora de robustez Nivel 1
    const parsed = AnalyzeWebsiteOutputSchema.safeParse(llmResponse.output);

    if (!parsed.success) {
      console.error('Error de validación de Zod en analyzeWebsite:', parsed.error);
      throw new Error('La IA ha devuelto un informe con un formato inesperado.');
    }
    
    return parsed.data;
  }
);
