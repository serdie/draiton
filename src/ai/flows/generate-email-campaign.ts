'use server';

/**
 * @fileOverview Flujo de Genkit para generar contenido para campañas de email.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
// 1. CORRECCIÓN: Importación correcta del paquete
import { googleAI } from '@genkit-ai/googleai'; 
import { 
    GenerateEmailCampaignInputSchema, 
    GenerateEmailCampaignOutputSchema, 
    type GenerateEmailCampaignInput, 
    type GenerateEmailCampaignOutput 
} from '@/ai/schemas/email-campaign-schemas'; // Asumimos que los schemas están definidos aquí

export async function generateEmailCampaign(input: GenerateEmailCampaignInput): Promise<GenerateEmailCampaignOutput> {
  return generateEmailCampaignFlow(input);
}

// --- PROMPT (Modelo corregido, instrucciones en español) ---
const prompt = ai.definePrompt({
  name: 'generateEmailCampaignPrompt',
  input: { schema: GenerateEmailCampaignInputSchema },
  output: { schema: GenerateEmailCampaignOutputSchema },
  // 2. CORRECCIÓN: Modelo estandarizado
  model: googleAI.model('gemini-2.5-flash-lite'), 
  prompt: `Eres un experto en email marketing. Tu tarea es escribir un correo electrónico convincente basado en los siguientes objetivos.

**Objetivo de la Campaña:** {{{campaignGoal}}}
**Público Objetivo:** {{{targetAudience}}}
**Tono deseado:** {{{tone}}}
**Información Clave a Incluir:** {{{keyInfo}}}

Basado en esto, genera un asunto ('subject') y un cuerpo ('body') para el correo. El cuerpo debe ser claro, persuasivo y terminar con una llamada a la acción (CTA) clara. Escribe el correo SIEMPRE en español. Responde ÚNICAMENTE con el formato JSON requerido.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const generateEmailCampaignFlow = ai.defineFlow(
  {
    name: 'generateEmailCampaignFlow',
    inputSchema: GenerateEmailCampaignInputSchema,
    outputSchema: GenerateEmailCampaignOutputSchema,
  },
  async (input: GenerateEmailCampaignInput) => { // Añadimos tipo a input
    try {
      // 3. Llamamos al prompt (el modelo ya está definido en el prompt)
      const { output } = await prompt(input); 
                                        // No necesitamos pasar el modelo aquí

      // 4. Validamos la salida con safeParse
      const parsed = GenerateEmailCampaignOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de Zod en generateEmailCampaign:', parsed.error);
        throw new Error('La IA ha devuelto contenido de email con formato inesperado.');
      }
      
      return parsed.data; // Devolvemos los datos validados

    } catch (error) {
      // 5. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en generateEmailCampaignFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudo generar la campaña de email. Error: ${message}`);
    }
  }
);
