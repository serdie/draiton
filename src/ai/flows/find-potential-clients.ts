'use server';

/**
 * @fileOverview A Genkit flow to find potential B2B clients for a business.
 * (Versión corregida con 'website' opcional)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Actualizados con 'website' opcional) ---

const FindPotentialClientsInputSchema = z.object({
  productsAndServices: z.string().describe('A detailed description of the products or services the user offers.'),
  existingClientProfile: z.string().describe('A description of the ideal or existing client profile (e.g., industry, company size, needs).'),
  companyLocation: z.string().describe('The geographical location of the user\'s business to focus the search (city, region).'),
});
export type FindPotentialClientsInput = z.infer<typeof FindPotentialClientsInputSchema>;

// 1. CORRECCIÓN: Hacemos 'website' opcional añadiendo `.optional()`
const PotentialClientSchema = z.object({
  name: z.string().describe('The name of the potential client company.'),
  profile: z.string().describe('A brief profile of the potential client, including their industry and size.'),
  reasoning: z.string().describe('A clear explanation of why this company is a good potential client.'),
  website: z.string().url().optional().describe('The official website URL of the potential client, if found.'), // <-- Añadido .optional()
  email: z.string().optional().describe('El email de contacto público (ej. info@, contacto@) si se encuentra.'),
  telefono: z.string().optional().describe('El teléfono de contacto público si se encuentra.'),
});

const FindPotentialClientsOutputSchema = z.object({
  potentialClients: z.array(PotentialClientSchema).describe('A list of potential B2B clients.'),
});
export type FindPotentialClientsOutput = z.infer<typeof FindPotentialClientsOutputSchema>;

export async function findPotentialClients(input: FindPotentialClientsInput): Promise<FindPotentialClientsOutput> {
  return findPotentialClientsFlow(input);
}

// --- FLUJO CORREGIDO (CON PROMPT MEJORADO PARA 'website' opcional) ---

const findPotentialClientsFlow = ai.defineFlow(
  {
    name: 'findPotentialClientsFlow',
    inputSchema: FindPotentialClientsInputSchema,
    outputSchema: FindPotentialClientsOutputSchema,
  },
  async (input: FindPotentialClientsInput) => {
    
    console.log("Paso 1: Iniciando búsqueda de Clientes B2B...");

    // === PASO 1: BÚSQUEDA (Prompt mejorado) ===
    
    const searchPrompt = `You are an expert business researcher. Use the search tool to find potential B2B clients in Spain matching this profile:
    - We sell: ${input.productsAndServices}
    - We are looking for: ${input.existingClientProfile}
    - Our location: ${input.companyLocation}

    Return a detailed text summary of your findings, including company names, their profiles, why they are a good fit, their websites (only include if a valid URL is found), and if available, a public contact email and phone number.
    Responde SIEMPRE en español.`; // <-- Instrucción añadida para website

    let searchResultsText = '';
    try {
      const searchResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'),
        prompt: searchPrompt,
        config: {
          tools: [{ googleSearch: {} }] 
        },
      });
      searchResultsText = searchResponse.text;

    } catch (error) {
      console.error(`Error en el Paso 1 (Búsqueda de Clientes):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error durante la búsqueda de clientes: ${message}`);
    }

    console.log("Paso 2: Estructurando resultados de Clientes...");

    // === PASO 2: ESTRUCTURACIÓN (Prompt mejorado) ===
    
    // 2. CORRECCIÓN: Instrucción para omitir 'website' si no es URL
    const formatPrompt = `You are an expert data processor. Take the following block of text, which contains my research notes on potential clients, and parse it into a structured JSON format.
    
    Research Notes:
    """
    ${searchResultsText}
    """

    Extract all companies into the 'potentialClients' array. 
    Ensure the 'website' field is only included if it contains a valid URL. If the notes mention that a website was not found or provide text instead of a URL, omit the 'website' field entirely for that client.
    Extract 'email' and 'telefono' if they were found in the notes. If they are not present, leave the fields undefined.
    Respond ONLY with the JSON.`;

    try {
      const llmResponse = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'),
        prompt: formatPrompt,
        output: { schema: FindPotentialClientsOutputSchema },
      });

      const parsed = FindPotentialClientsOutputSchema.safeParse(llmResponse.output);

      if (!parsed.success) {
        console.error('Error de Zod en findPotentialClients (Paso 2):', parsed.error);
        throw new Error('La IA ha devuelto una lista de clientes con un formato inesperado.');
      }
      
      return parsed.data;

    } catch (error) {
      console.error(`Error en el Paso 2 (Estructuración de Clientes):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Error al formatear los clientes encontrados: ${message}`);
    }
  }
);
