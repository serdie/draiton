'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a website and providing improvement suggestions.
 * (Versión final con scraping real y robustez)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit'; // Solo necesitamos 'z' de genkit

// --- ESQUEMAS (Sin cambios) ---

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

// --- FUNCIÓN HELPER PARA LEER LA WEB (NO es una tool de Genkit) ---

async function browseWebsite(input: { url: string }): Promise<{ content: string }> {
  try {
    const response = await fetch(input.url);
    if (!response.ok) {
      throw new Error(`Error al acceder a la URL: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    // Simplificamos el HTML para que quepa en el prompt
    const simplifiedText = text
      .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '') // Quita CSS
      .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '') // Quita JS
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '') // Quita barras de navegación (a menudo ruido)
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '') // Quita footers
      .replace(/<[^>]+>/g, ' ') // Quita todas las demás etiquetas HTML dejando el texto
      .replace(/(\r\n|\n|\r)/gm, ' ') // Quita saltos de línea
      .replace(/\s+/g, ' ') // Quita espacios extra
      .trim() // Quita espacios al inicio/final
      .substring(0, 150000); // Limitamos longitud (ajusta si es necesario)

    console.log(`Contenido simplificado de ${input.url} (primeros 200 chars): ${simplifiedText.substring(0,200)}...`);
    return { content: simplifiedText };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error en browseWebsite para ${input.url}:`, message);
    // Devolvemos el error en 'content' para manejarlo en el flujo
    return { content: `Error: No se pudo acceder o procesar la página. ${message}` };
  }
}

// --- FLUJO CORREGIDO (USA LA FUNCIÓN HELPER) ---

const analyzeWebsiteFlow = ai.defineFlow(
  {
    name: 'analyzeWebsiteFlow',
    inputSchema: AnalyzeWebsiteInputSchema,
    outputSchema: AnalyzeWebsiteOutputSchema,
  },
  async (input: AnalyzeWebsiteInput) => {
    
    // PASO 1: Usamos nuestra función 'helper' para leer el contenido real
    console.log(`Iniciando análisis de: ${input.url}`);
    const { content: pageContent } = await browseWebsite(input);

    // Si hubo un error al leer la web, lanzamos un error claro
    if (pageContent.startsWith('Error:')) {
      throw new Error(pageContent);
    }
    if (!pageContent || pageContent.trim().length < 50) { // Comprobación básica de contenido útil
        throw new Error('No se pudo extraer suficiente contenido relevante de la página web para el análisis.');
    }

    // PASO 2: Creamos el prompt con el contenido real de la página
    // (Prompt mejorado para centrarse en el texto extraído)
    const prompt = `You are a world-class web development and digital marketing consultant. Analyze the following TEXT CONTENT extracted from the website ${input.url} and generate a structured report with actionable improvement points. Respond ALWAYS in Spanish.

Extracted Text Content:
"""
${pageContent}
"""

Based ONLY on this extracted text, provide a detailed analysis covering:
1.  **SEO:** Analyze potential on-page SEO factors visible in the text (e.g., clarity of headings inferred from structure, keyword density if apparent, logical flow of information). Note limitations due to lack of HTML tags.
2.  **Performance/Speed:** Based on the text length, mention if the content seems excessive or could be simplified (this is a proxy for potential payload size). Note limitations.
3.  **UX/Design:** Evaluate clarity, calls to action, and structure based *only* on the readable text provided. Is the purpose clear? Is it easy to understand what the user should do next? Note limitations.
4.  **Security:** Check for mentions of insecure practices if any text suggests it (highly unlikely from text alone, but include the section). Note limitations.

Acknowledge that the analysis is based SOLELY on extracted text and lacks full HTML/CSS/JS context. For each area, provide specific points with title and suggestion. Be concise but thorough. Respond ONLY with the JSON.`;
    
    try {
        // PASO 3: Llamamos a la IA para que analice el TEXTO
        const llmResponse = await ai.generate({
            model: googleAI.model('gemini-2.5-flash-lite'), // Modelo estándar
            prompt: prompt,
            output: { schema: AnalyzeWebsiteOutputSchema },
        });
        
        // Aplicamos la robustez con safeParse
        const parsed = AnalyzeWebsiteOutputSchema.safeParse(llmResponse.output);

        if (!parsed.success) {
          console.error('Error de validación de Zod en analyzeWebsite:', parsed.error);
          throw new Error('La IA ha devuelto un informe con un formato inesperado.');
        }
        
        return parsed.data; // Devolvemos el resultado validado

    } catch (error) {
      // Capturamos cualquier error de la IA
      console.error(`Error en analyzeWebsiteFlow (llamada a IA):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudo generar el análisis. Error: ${message}`);
    }
  }
);