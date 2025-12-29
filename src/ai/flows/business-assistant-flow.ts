'use server';



/**

 * @fileOverview Asistente conversacional de IA capaz de analizar documentos.

 */



import { ai } from '@/ai/genkit';

import { googleAI } from '@genkit-ai/googleai';

import { z } from 'genkit';

import { MessageData } from 'genkit/model';



// --- ESQUEMAS (Con documentContent) ---

const BusinessAssistantInputSchema = z.object({

  history: z.array(z.custom<MessageData>()).describe('El historial de la conversación.'),

  message: z.string().describe('El último mensaje del usuario.'),

  documentContent: z.string().nullable().optional().describe('El contenido de un documento para analizar.'),

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



// --- SYSTEM PROMPT (Actualizado para mencionar análisis de documentos) ---

const systemPrompt: MessageData = {

  role: 'system',

  content: [

    {

      text: `Eres un asistente experto en negocios, finanzas, operaciones y marketing para autónomos y pymes en España.
Tu objetivo es proporcionar respuestas claras, concisas y accionables.
Si el usuario adjunta el contenido de un documento, basa tus respuestas en ese contenido. Puedes resumirlo, extraer información clave o responder preguntas específicas sobre él.
NO tienes acceso directo a los datos específicos del usuario (facturas, gastos) a menos que él te los proporcione en la conversación.
Cuando un usuario haga una pregunta que requiera datos específicos y no se te hayan proporcionado, pídele educadamente esa información. No inventes respuestas si no tienes los datos.
Mantén un tono profesional pero cercano. Responde SIEMPRE en español.`

    },

  ],

};



// --- FLUJO (Actualizado para manejar 'documentContent') ---

const businessAssistantFlow = ai.defineFlow(

  {

    name: 'businessAssistantFlow',

    inputSchema: BusinessAssistantInputSchema,

    outputSchema: BusinessAssistantOutputSchema,

  },

  async (input: BusinessAssistantInput) => {

   

    // Construimos el prompt del usuario, incluyendo el contenido del documento si existe.

    const userMessageContent = [];

    if (input.documentContent) {

        userMessageContent.push({ text: `He adjuntado un documento para que lo analices. Aquí está su contenido:\n\n---\n${input.documentContent}\n---\n\nAhora, ten en cuenta este documento para mi siguiente pregunta.` });

    }

    userMessageContent.push({ text: input.message });



    // Construimos el historial para la IA

    const history: MessageData[] = [

      systemPrompt,

      ...input.history,

      { role: 'user', content: userMessageContent },

    ];



    try {

      const response = await ai.generate({

        model: googleAI.model('gemini-2.5-flash-lite'),

        messages: history,

      });



      const text = response.text;



      if (text === undefined || text === '') {

        console.error('La respuesta de la IA vino vacía.');

        throw new Error('El asistente de IA no pudo generar una respuesta esta vez.');

      }
     
      return { response: text };



    } catch (error) {

      console.error(`Error en businessAssistantFlow:`, error);

      const message = error instanceof Error ? error.message : String(error);

      throw new Error(`No se pudo obtener respuesta del asistente. Error: ${message}`);

    }
  }

);
    
