
'use server';

/**
 * @fileOverview Flujo de Genkit para buscar convenios colectivos españoles.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

export const FindCollectiveAgreementInputSchema = z.object({
  scope: z.enum(['nacional', 'autonomico', 'provincial']).describe('El ámbito geográfico del convenio.'),
  region: z.string().optional().describe('La comunidad autónoma (si el ámbito es autonómico).'),
  province: z.string().optional().describe('La provincia (si el ámbito es provincial).'),
  sectorKeyword: z.string().describe('Palabra clave principal del sector (ej. "Hostelería", "Construcción").'),
});
export type FindCollectiveAgreementInput = z.infer<typeof FindCollectiveAgreementInputSchema>;

export const FindCollectiveAgreementOutputSchema = z.object({
  agreements: z.array(z.object({
    title: z.string().describe('El título completo y oficial del convenio colectivo.'),
    publicationDate: z.string().describe('La fecha de publicación en el boletín oficial (formato AAAA-MM-DD).'),
    sourceLink: z.string().url().describe('El enlace directo al documento oficial (BOE, boletín autonómico, etc.).'),
  })).describe('Una lista de los convenios colectivos más relevantes encontrados.'),
});
export type FindCollectiveAgreementOutput = z.infer<typeof FindCollectiveAgreementOutputSchema>;


export async function findCollectiveAgreement(input: FindCollectiveAgreementInput): Promise<FindCollectiveAgreementOutput> {
  return findCollectiveAgreementFlow(input);
}


const findCollectiveAgreementFlow = ai.defineFlow(
  {
    name: 'findCollectiveAgreementFlow',
    inputSchema: FindCollectiveAgreementInputSchema,
    outputSchema: FindCollectiveAgreementOutputSchema,
  },
  async (input) => {
    
    let locationQuery = '';
    if (input.scope === 'autonomico' && input.region) {
        locationQuery = ` de ${input.region}`;
    } else if (input.scope === 'provincial' && input.province) {
        locationQuery = ` de ${input.province}`;
    }

    const searchQuery = `convenio colectivo ${input.sectorKeyword}${locationQuery} España ${new Date().getFullYear()} site:boe.es OR site:*.gob.es`;

    const searchPrompt = `Eres un experto en legislación laboral española. Usa la herramienta de búsqueda para encontrar el convenio colectivo más reciente y relevante para el siguiente perfil. Busca en el Boletín Oficial del Estado (BOE) o boletines autonómicos.

    - Ámbito: ${input.scope}
    - Localización: ${input.region || input.province || 'Nacional'}
    - Sector: ${input.sectorKeyword}
    - Consulta de búsqueda generada: "${searchQuery}"

    Devuelve un resumen en texto de los convenios encontrados, incluyendo su título completo, fecha de publicación y la URL directa al documento oficial. Responde SIEMPRE en español.`;

    let searchResultsText = '';
    try {
      const searchResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'),
        prompt: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      searchResultsText = searchResponse.text;

       if (!searchResultsText || searchResultsText.trim().length < 10) {
         throw new Error('La búsqueda inicial no encontró convenios relevantes.');
      }

    } catch (error) {
      console.error(`Error en la búsqueda de convenios:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error durante la búsqueda de convenios: ${message}`);
    }

    const formatPrompt = `Eres un experto procesador de datos. Analiza el siguiente texto, que contiene los resultados de una búsqueda de convenios colectivos, y conviértelo al formato JSON estructurado requerido.

    Texto con Resultados:
    """
    ${searchResultsText}
    """

    Extrae todos los convenios en el array 'agreements'. Para cada uno, proporciona el 'title' (título completo), 'publicationDate' (en formato AAAA-MM-DD) y 'sourceLink' (URL válida). Responde ÚNICAMENTE con el JSON.`;

    try {
      const llmResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'),
        prompt: formatPrompt,
        output: { schema: FindCollectiveAgreementOutputSchema },
      });
      
      const parsed = FindCollectiveAgreementOutputSchema.safeParse(llmResponse.output);
      if (!parsed.success) {
        console.error('Error de Zod en findCollectiveAgreement:', parsed.error);
        throw new Error('La IA devolvió una lista de convenios con un formato inesperado.');
      }
      
      return parsed.data;

    } catch (error) {
      console.error(`Error en la estructuración de convenios:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error al formatear los convenios encontrados: ${message}`);
    }
  }
);
