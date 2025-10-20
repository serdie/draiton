'use server';

/**
 * @fileOverview Asistente conversacional de IA (versión sin acceso a datos).
 * (Versión anterior, funcional pero genérica)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import { MessageData } from 'genkit/model';
// NO importamos firebase-admin ni defineTool

// --- ESQUEMAS (Versión simple, sin userId) ---
const BusinessAssistantInputSchema = z.object({
  // NO userId aquí
  history: z.array(z.custom<MessageData>()).describe('El historial de la conversación.'),
  message: z.string().describe('El último mensaje del usuario.'),
});
export type BusinessAssistantInput = z.infer<typeof BusinessAssistantInputSchema>;

const BusinessAssistantOutputSchema = z.object({
  response: z.string().describe("La respuesta del asistente de IA."),
});
export type BusinessAssistantOutput = z.infer<typeof BusinessAssistantOutputSchema>;

export async function businessAssistant(
  input: BusinessAssistantInput
): Promise<BusinessAssistantOutput> {
  return businessAssistantFlow(input);
}

// --- SYSTEM PROMPT (Versión original, sin mencionar herramientas) ---
const systemPrompt: MessageData = {
  role: 'system',
  content: [
    {
      text: `Eres GestorIA, un asistente experto en negocios, finanzas, operaciones y marketing para autónomos y pymes en España.
Tu objetivo es proporcionar respuestas claras, concisas y accionables.
NO tienes acceso directo a los datos específicos del usuario (facturas, gastos) a menos que él te los proporcione en la conversación.
Cuando un usuario haga una pregunta que requiera datos específicos, pídele educadamente esa información. No inventes respuestas si no tienes los datos.
Mantén un tono profesional pero cercano. Responde SIEMPRE en español.`
    },
  ],
};

// --- FLUJO BÁSICO (Sin herramientas) ---
const businessAssistantFlow = ai.defineFlow( // Usamos ai.defineFlow
  {
    name: 'businessAssistantFlow',
    inputSchema: BusinessAssistantInputSchema,
    outputSchema: BusinessAssistantOutputSchema,
  },
  async (input: BusinessAssistantInput) => {
    // Construimos el historial para la IA
    const history: MessageData[] = [
      systemPrompt,
      ...input.history,
      { role: 'user', content: [{ text: input.message }] },
    ];

    try {
      // Llamamos a la IA con el modelo y los mensajes
      // SIN 'tools'
      const response = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'), 
        messages: history,
      });

      // Extraemos el texto de la respuesta (sin paréntesis)
      const text = response.text; 

      // Comprobamos si hubo respuesta
      if (text === undefined || text === '') {
        console.error('La respuesta de la IA vino vacía.');
        throw new Error('El asistente de IA no pudo generar una respuesta esta vez.');
      }
      
      return { response: text };

    } catch (error) {
      // Capturamos cualquier error (API, red, etc.)
      console.error(`Error en businessAssistantFlow (versión básica):`, error);
      const message = error instanceof Error ? error.message : String(error);
      // Devolvemos un error amigable
      throw new Error(`No se pudo obtener respuesta del asistente. Error: ${message}`);
    }
  }
);