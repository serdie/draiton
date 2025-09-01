
'use server';

/**
 * @fileOverview A conversational AI assistant for business insights.
 *
 * - businessAssistant - A function that handles conversational interactions.
 * - BusinessAssistantInput - The input type for the function.
 * - BusinessAssistantOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MessageData, Part } from 'genkit/model';


const BusinessAssistantInputSchema = z.object({
    history: z.array(z.custom<MessageData>()).describe("The conversation history."),
    message: z.string().describe('The latest user message.'),
});
export type BusinessAssistantInput = z.infer<typeof BusinessAssistantInputSchema>;


const BusinessAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response.'),
});
export type BusinessAssistantOutput = z.infer<typeof BusinessAssistantOutputSchema>;

export async function businessAssistant(input: BusinessAssistantInput): Promise<BusinessAssistantOutput> {
  return businessAssistantFlow(input);
}


const systemPrompt = `Eres GestorIA, un asistente experto en negocios, finanzas, operaciones y marketing para autónomos y pymes en España.
Tu objetivo es proporcionar respuestas claras, concisas y accionables.
Tienes acceso a los datos de la aplicación del usuario, como facturas, gastos, proyectos y clientes.
Cuando un usuario haga una pregunta, utiliza la información disponible para dar una respuesta informada.
Si la información no está disponible, indícalo claramente en lugar de inventar una respuesta.
Mantén un tono profesional pero cercano.`;


const businessAssistantFlow = ai.defineFlow(
  {
    name: 'businessAssistantFlow',
    inputSchema: BusinessAssistantInputSchema,
    outputSchema: BusinessAssistantOutputSchema,
  },
  async (input) => {
    
    const llm = ai.model('gemini-2.0-flash');
    const history: MessageData[] = [...input.history];

     history.unshift({
      role: 'system',
      content: [{ text: systemPrompt }],
    });

    history.push({
      role: 'user',
      content: [{ text: input.message }],
    });

    const { content } = await llm.generate({
      history,
    });
    
    return { response: content[0].text! };
  }
);
