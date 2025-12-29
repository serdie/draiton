'use server';

/**
 * @fileOverview Flujo de Genkit para encontrar clientes B2B potenciales, incluyendo scraping opcional.
 * (Versión final con activación correcta de googleSearch, 2 pasos, robusta y en español)
 */

// 1. CORRECCIÓN: Solo importamos 'ai', 'googleAI' y 'z'. 'googleSearch' NO se importa.
import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Con website, email, telefono opcionales) ---
const FindPotentialClientsInputSchema = z.object({
  productsAndServices: z.string().describe('Descripción detallada de los productos o servicios ofrecidos.'),
  existingClientProfile: z.string().describe('Descripción del perfil de cliente ideal o existente (ej. sector, tamaño).'),
  companyLocation: z.string().describe('Ubicación geográfica del negocio del usuario (ciudad, región).'),
});
export type FindPotentialClientsInput = z.infer<typeof FindPotentialClientsInputSchema>;

const PotentialClientSchema = z.object({
  name: z.string().describe('El nombre de la empresa cliente potencial.'),
  profile: z.string().describe('Breve perfil del cliente potencial (sector, tamaño).'),
  reasoning: z.string().describe('Explicación clara de por qué es un buen cliente potencial.'),
  website: z.string().url().optional().describe('La URL del sitio web oficial (si se encuentra).'),
  email: z.string().optional().describe('El email de contacto público (ej. info@) si se encuentra.'),
  telefono: z.string().optional().describe('El teléfono de contacto público si se encuentra.'),
});

const FindPotentialClientsOutputSchema = z.object({
  potentialClients: z.array(PotentialClientSchema).describe('Lista de clientes B2B potenciales.'),
});
export type FindPotentialClientsOutput = z.infer<typeof FindPotentialClientsOutputSchema>;

export async function findPotentialClients(input: FindPotentialClientsInput): Promise<FindPotentialClientsOutput> {
  return findPotentialClientsFlow(input);
}

// --- FLUJO CORREGIDO Y ROBUSTO (EN 2 PASOS) ---

const findPotentialClientsFlow = ai.defineFlow(
  {
    name: 'findPotentialClientsFlow',
    inputSchema: FindPotentialClientsInputSchema,
    outputSchema: FindPotentialClientsOutputSchema,
  },
  async (input: FindPotentialClientsInput) => {
    
    console.log("Paso 1: Iniciando búsqueda de Clientes B2B...");

    // === PASO 1: BÚSQUEDA (Usar Herramienta + Pedir Texto Simple) ===
    
    const searchPrompt = `Eres un experto investigador de negocios. Usa la herramienta de búsqueda para encontrar empresas en España que encajen con este perfil de cliente potencial:
    - Necesitan: ${input.productsAndServices}
    - Perfil buscado: ${input.existingClientProfile}
    - Ubicación preferente: ${input.companyLocation}

    Devuelve un resumen detallado en texto de tus hallazgos. Para cada empresa encontrada, incluye su nombre, un breve perfil, por qué encaja, su sitio web (si lo encuentras), y si es posible, un email y teléfono de contacto públicos.
    **Responde SIEMPRE en español.**`;

    let searchResultsText = '';
    try {
      const searchResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'),
        prompt: searchPrompt,
        // NO 'output: { schema: ... }'
        // 2. CORRECCIÓN: La búsqueda se activa así, en 'config'
        config: {
          tools: [{ googleSearch: {} }] 
        },
      });
      searchResultsText = searchResponse.text;

       if (!searchResultsText || searchResultsText.trim().length < 10) {
         throw new Error('La búsqueda inicial no encontró clientes potenciales relevantes.');
      }

    } catch (error) {
      console.error(`Error en el Paso 1 (Búsqueda de Clientes):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error durante la búsqueda de clientes: ${message}`);
    }

    console.log("Paso 2: Estructurando resultados de Clientes...");

    // === PASO 2: ESTRUCTURACIÓN (Pedir JSON + Sin Herramienta) ===
    
    const formatPrompt = `Eres un experto procesador de datos. Analiza el siguiente texto, que contiene notas sobre clientes potenciales, y conviértelo al formato JSON estructurado requerido.

    Notas de Investigación:
    """
    ${searchResultsText}
    """

    Extrae todas las empresas en el array 'potentialClients'.
    Asegúrate de que el campo 'website' solo se incluya si es una URL válida. Si las notas indican que no se encontró o dan texto en lugar de URL, omite el campo 'website' para ese cliente.
    Extrae 'email' y 'telefono' si se encontraron en las notas. Si no están presentes, omite esos campos.
    Responde ÚNICAMENTE con el JSON.`;

    try {
      const llmResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'),
        prompt: formatPrompt,
        output: { schema: FindPotentialClientsOutputSchema }, // SÍ pedimos JSON aquí
        // NO activamos tools aquí
      });

      // 3. Añadimos robustez con safeParse
      const parsed = FindPotentialClientsOutputSchema.safeParse(llmResponse.output);

      if (!parsed.success) {
        console.error('Error de Zod en findPotentialClients (Paso 2):', parsed.error);
        throw new Error('La IA devolvió una lista de clientes con un formato inesperado.');
      }
      
      return parsed.data; // Devolvemos datos validados

    } catch (error) {
      console.error(`Error en el Paso 2 (Estructuración de Clientes):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error al formatear los clientes encontrados: ${message}`);
    }
  }
);
