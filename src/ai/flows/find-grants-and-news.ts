'use server';

/**
 * @fileOverview Flujo de Genkit para encontrar ayudas y noticias relevantes para un negocio.
 * (Versión final con activación correcta de googleSearch, 2 pasos, robusta y en español)
 */

// 1. CORRECCIÓN DEFINITIVA: Solo importamos 'ai', 'googleAI' y 'z'. 'googleSearch' NO se importa.
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Descripciones en español) ---
const FindGrantsAndNewsInputSchema = z.object({
  businessSector: z.string().describe('El sector económico del negocio (ej. hostelería, tecnología).'),
  businessLocation: z.string().describe('La ubicación del negocio (Ciudad y/o C. Autónoma en España).'),
  employeeCount: z.number().describe('El número de empleados.'),
  businessDescription: z.string().describe('Breve descripción del negocio.'),
});
export type FindGrantsAndNewsInput = z.infer<typeof FindGrantsAndNewsInputSchema>;

const GrantOrNewsSchema = z.object({
  title: z.string().describe('El título conciso de la ayuda o noticia.'),
  summary: z.string().describe('Un breve resumen explicando su relevancia para el negocio.'),
  sourceLink: z.string().url().describe('La URL directa a la fuente oficial.'),
});

const FindGrantsAndNewsOutputSchema = z.object({
  grants: z.array(GrantOrNewsSchema).describe('Lista de ayudas, subvenciones o financiación pública relevantes.'),
  news: z.array(GrantOrNewsSchema).describe('Lista de noticias económicas o de negocio relevantes.'),
});
export type FindGrantsAndNewsOutput = z.infer<typeof FindGrantsAndNewsOutputSchema>;

export async function findGrantsAndNews(input: FindGrantsAndNewsInput): Promise<FindGrantsAndNewsOutput> {
  return findGrantsAndNewsFlow(input);
}

// --- FLUJO CORREGIDO Y ROBUSTO (EN 2 PASOS) ---

const findGrantsAndNewsFlow = ai.defineFlow(
  {
    name: 'findGrantsAndNewsFlow',
    inputSchema: FindGrantsAndNewsInputSchema,
    outputSchema: FindGrantsAndNewsOutputSchema,
  },
  async (input: FindGrantsAndNewsInput) => {
    
    console.log("Paso 1: Iniciando búsqueda de Ayudas y Noticias...");

    // === PASO 1: BÚSQUEDA (Usar Herramienta + Pedir Texto Simple) ===
    const searchPrompt = `Eres un consultor experto en el mercado español. Usa la herramienta de búsqueda para encontrar las ayudas públicas (nacionales, regionales, locales) y noticias económicas más recientes (últimos 6 meses) relevantes para este perfil de negocio:
    - Sector: ${input.businessSector}
    - Ubicación: ${input.businessLocation}
    - Descripción: ${input.businessDescription}

    Devuelve un resumen detallado en texto de tus hallazgos, incluyendo títulos, un breve resumen de cada uno y la URL de la fuente. Responde SIEMPRE en español.`;

    let searchResultsText = '';
    try {
      const searchResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'), 
        prompt: searchPrompt,
        // NO pedimos JSON aquí para evitar el error 400
        // 2. CORRECCIÓN DEFINITIVA: La búsqueda se activa así, en 'config'
        config: {
          tools: [{ googleSearch: {} }] 
        },
      });
      searchResultsText = searchResponse.text; 

      if (!searchResultsText || searchResultsText.trim().length < 10) {
         throw new Error('La búsqueda inicial no encontró resultados relevantes.');
      }

    } catch (error) {
      console.error(`Error en el Paso 1 (Búsqueda Ayudas/Noticias):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error durante la búsqueda de información: ${message}`);
    }

    console.log("Paso 2: Estructurando resultados...");

    // === PASO 2: ESTRUCTURACIÓN (Pedir JSON + Sin Herramienta) ===
    const formatPrompt = `Eres un experto procesador de datos. Analiza el siguiente texto, que contiene resultados de búsqueda de ayudas y noticias, y conviértelo al formato JSON estructurado requerido.

    Texto con Resultados de Búsqueda:
    """
    ${searchResultsText}
    """

    Extrae todas las ayudas/subvenciones en el array 'grants' y todas las noticias en el array 'news'. Asegúrate de que todos los 'sourceLink' sean URLs válidas. Responde ÚNICAMENTE con el JSON.`;

    try {
      const llmResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'),
        prompt: formatPrompt,
        output: { schema: FindGrantsAndNewsOutputSchema }, 
        // NO activamos tools aquí
      });

      const parsed = FindGrantsAndNewsOutputSchema.safeParse(llmResponse.output);

      if (!parsed.success) {
        console.error('Error de Zod en findGrantsAndNews (Paso 2):', parsed.error);
        throw new Error('La IA devolvió una respuesta con un formato inesperado tras la búsqueda.');
      }
      
      return parsed.data; 

    } catch (error) {
      console.error(`Error en el Paso 2 (Estructuración Ayudas/Noticias):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error al formatear los resultados de la búsqueda: ${message}`);
    }
  }
);