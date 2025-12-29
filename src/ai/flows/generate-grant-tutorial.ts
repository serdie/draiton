'use server';

/**
 * @fileOverview Flujo de Genkit para generar un tutorial paso a paso para solicitar una ayuda.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Descripciones en español) ---

const GenerateGrantTutorialInputSchema = z.object({
  grantTitle: z.string().describe('El título de la ayuda o subvención.'),
  sourceLink: z.string().url().describe('La URL a la fuente oficial de la ayuda.'),
});
export type GenerateGrantTutorialInput = z.infer<typeof GenerateGrantTutorialInputSchema>;

const TutorialStepSchema = z.object({
  step: z.string().describe('Un título conciso para el paso (ej. "Verificar Elegibilidad").'),
  description: z.string().describe('Una explicación detallada de las acciones a realizar en este paso.'),
});

const GenerateGrantTutorialOutputSchema = z.object({
  tutorial: z.array(TutorialStepSchema).describe('Lista de pasos a seguir para solicitar la ayuda.'),
});
export type GenerateGrantTutorialOutput = z.infer<typeof GenerateGrantTutorialOutputSchema>;

export async function generateGrantTutorial(input: GenerateGrantTutorialInput): Promise<GenerateGrantTutorialOutput> {
  return generateGrantTutorialFlow(input);
}

// --- PROMPT (Instrucciones en español, el modelo se añade en el flow) ---
const prompt = ai.definePrompt({
  name: 'generateGrantTutorialPrompt',
  input: { schema: GenerateGrantTutorialInputSchema },
  output: { schema: GenerateGrantTutorialOutputSchema },
  prompt: `Eres un consultor experto en la solicitud de ayudas y subvenciones públicas en España. Tu tarea es crear un tutorial claro y detallado, paso a paso, para que un autónomo o pyme pueda solicitar la siguiente ayuda:

**Nombre de la Ayuda:** {{{grantTitle}}}
**Enlace a la fuente oficial:** {{{sourceLink}}}

Analiza el contexto de la ayuda y crea una guía práctica. No inventes información. Si no puedes acceder al contenido del enlace, basa tus pasos en el proceso general de solicitud de ayudas en España.

**Instrucciones para la guía:**
1.  **Lenguaje Claro y Sencillo:** Evita jerga administrativa.
2.  **Pasos Accionables:** Cada paso debe ser una acción concreta.
3.  **Orden Lógico:** Desde la preparación hasta la presentación.
4.  **Consejos Útiles:** Incluye consejos (documentos, detalles importantes).

Genera una lista de pasos ('tutorial'), cada uno con un título ('step') y una descripción ('description'). Responde SIEMPRE en español y ÚNICAMENTE con el formato JSON requerido.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const generateGrantTutorialFlow = ai.defineFlow(
  {
    name: 'generateGrantTutorialFlow',
    inputSchema: GenerateGrantTutorialInputSchema,
    outputSchema: GenerateGrantTutorialOutputSchema,
  },
  async (input: GenerateGrantTutorialInput) => { // Añadimos tipo a input
    try {
      // 1. Llamamos al prompt especificando el modelo
      const { output } = await prompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'), // Modelo añadido aquí
      });

      // 2. Validamos la salida con safeParse
      const parsed = GenerateGrantTutorialOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de Zod en generateGrantTutorial:', parsed.error);
        throw new Error('La IA ha devuelto el tutorial con formato inesperado.');
      }
      
      return parsed.data; // Devolvemos los datos validados

    } catch (error) {
      // 3. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en generateGrantTutorialFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudo generar el tutorial para la ayuda. Error: ${message}`);
    }
  }
);
