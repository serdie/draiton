'use server';

/**
 * @fileOverview A Genkit flow to find relevant grants and news for a business.
 * (Versión corregida con flujo de 2 pasos para evitar error 400)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
// No necesitamos 'googleSearch' aquí, se activa en 'config'

// --- ESQUEMAS (Sin cambios) ---
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

// --- FLUJO CORREGIDO (AHORA EN 2 PASOS) ---

const findGrantsAndNewsFlow = ai.defineFlow(
  {
    name: 'findGrantsAndNewsFlow',
    inputSchema: FindGrantsAndNewsInputSchema,
    outputSchema: FindGrantsAndNewsOutputSchema,
  },
  async (input: FindGrantsAndNewsInput) => {
    
    console.log("Paso 1: Iniciando búsqueda de Ayudas y Noticias...");

    // === PASO 1: BÚSQUEDA (Usar Herramienta + Pedir Texto Simple) ===
    // Primero, le pedimos a la IA que busque y nos dé un resumen en texto.

    const searchPrompt = `You are an expert business researcher. Use the search tool to find relevant grants, subsidies, and news for the following business profile in Spain:
    - Sector: ${input.businessSector}
    - Location: ${input.businessLocation}
    - Description: ${input.businessDescription}

    Return a detailed text summary of your findings, including titles, a brief summary of each, and the source URL.`;

    let searchResultsText = '';
    try {
      const searchResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'), 
        prompt: searchPrompt,
        // NO 'output: { schema: ... }' <-- Esta es la clave para evitar el error
        config: {
          tools: [{ googleSearch: {} }] // Así se activa la búsqueda
        },
      });
      searchResultsText = searchResponse.text; // Capturamos la respuesta de texto

    } catch (error) {
      console.error(`Error en el Paso 1 (Búsqueda):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error durante la búsqueda de información: ${message}`);
    }

    console.log("Paso 2: Estructurando resultados...");

    // === PASO 2: ESTRUCTURACIÓN (Pedir JSON + Sin Herramienta) ===
    // Ahora, le damos el texto del Paso 1 y le pedimos que lo formatee en JSON.

    const formatPrompt = `You are an expert data processor. Take the following block of text, which contains search results, and parse it into a structured JSON format.
    
    Search Results Text:
    """
    ${searchResultsText}
    """

    Extract all grants into the 'grants' array and all news into the 'news' array. Ensure all sourceLink are valid URLs. Respond ONLY with the JSON.`;

    try {
      const llmResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'),
        prompt: formatPrompt,
        output: { schema: FindGrantsAndNewsOutputSchema }, // SÍ especificamos JSON aquí
        // NO 'config: { tools: ... }' aquí
      });

      // Aplicamos la robustez
      const parsed = FindGrantsAndNewsOutputSchema.safeParse(llmResponse.output);

      if (!parsed.success) {
        console.error('Error de validación de Zod en findGrantsAndNews (Paso 2):', parsed.error);
        throw new Error('La IA ha devuelto una respuesta con un formato inesperado después de la búsqueda.');
      }
      
      return parsed.data;

    } catch (error) {
      console.error(`Error en el Paso 2 (Estructuración):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error al formatear los resultados de la búsqueda: ${message}`);
    }
  }
);
