
'use server';

/**
 * @fileOverview A Genkit flow to generate a step-by-step tutorial for applying for a grant.
 *
 * - generateGrantTutorial - A function that takes grant details and returns a tutorial.
 * - GenerateGrantTutorialInput - The input type for the function.
 * - GenerateGrantTutorialOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { z } from 'genkit';

const GenerateGrantTutorialInputSchema = z.object({
  grantTitle: z.string().describe('The title of the grant or subsidy.'),
  sourceLink: z.string().url().describe('The URL to the official source of the grant.'),
});
export type GenerateGrantTutorialInput = z.infer<typeof GenerateGrantTutorialInputSchema>;

const TutorialStepSchema = z.object({
    step: z.string().describe('A concise title for the step (e.g., "Verificar Elegibilidad").'),
    description: z.string().describe('A detailed explanation of the actions to take in this step.'),
});

const GenerateGrantTutorialOutputSchema = z.object({
  tutorial: z.array(TutorialStepSchema).describe('A list of steps to follow to apply for the grant.'),
});
export type GenerateGrantTutorialOutput = z.infer<typeof GenerateGrantTutorialOutputSchema>;

export async function generateGrantTutorial(input: GenerateGrantTutorialInput): Promise<GenerateGrantTutorialOutput> {
  return generateGrantTutorialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateGrantTutorialPrompt',
  input: { schema: GenerateGrantTutorialInputSchema },
  output: { schema: GenerateGrantTutorialOutputSchema },
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `Eres un consultor experto en la solicitud de ayudas y subvenciones públicas en España. Tu tarea es crear un tutorial claro y detallado, paso a paso, para que un autónomo o pyme pueda solicitar la siguiente ayuda:

**Nombre de la Ayuda:** {{{grantTitle}}}
**Enlace a la fuente oficial:** {{{sourceLink}}}

Analiza el contexto de la ayuda y crea una guía práctica. No inventes información que no puedas deducir de forma lógica. Si no tienes acceso al contenido del enlace, basa tus pasos en el proceso general de solicitud de ayudas en España.

**Instrucciones para la guía:**
1.  **Lenguaje Claro y Sencillo:** Evita la jerga administrativa siempre que sea posible.
2.  **Pasos Accionables:** Cada paso debe describir una acción concreta que el usuario deba realizar.
3.  **Orden Lógico:** Organiza los pasos en una secuencia lógica, desde la preparación inicial hasta la presentación.
4.  **Consejos Útiles:** Incluye consejos prácticos, como qué documentos preparar con antelación o a qué detalles prestar especial atención.

Genera una lista de pasos para el tutorial. Responde SIEMPRE en español.`,
});

const generateGrantTutorialFlow = ai.defineFlow(
  {
    name: 'generateGrantTutorialFlow',
    inputSchema: GenerateGrantTutorialInputSchema,
    outputSchema: GenerateGrantTutorialOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
