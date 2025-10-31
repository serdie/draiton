'use server';

/**
 * @fileOverview Flujo de Genkit para revisar y explicar una nómina generada.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit'; // Importamos z desde genkit
import { 
    ReviewPayrollInputSchema,
    ReviewPayrollOutputSchema,
    type ReviewPayrollInput,
    type ReviewPayrollOutput 
} from '@/ai/schemas/payroll-schemas'; // Asumimos schemas importados de aquí

// ======================================================
// AQUÍ ESTÁ EL ARREGLO:
// Re-exportamos el tipo para que 'actions.ts' pueda encontrarlo
// ======================================================
export type { ReviewPayrollOutput } from '@/ai/schemas/payroll-schemas';
// ======================================================


export async function reviewPayroll(input: ReviewPayrollInput): Promise<ReviewPayrollOutput> {
    return reviewPayrollFlow(input);
}

// --- PROMPT (Instrucciones en español, el modelo se añade en el flow) ---
const prompt = ai.definePrompt({
  name: 'reviewPayrollPrompt',
  input: { schema: ReviewPayrollInputSchema },
  output: { schema: ReviewPayrollOutputSchema },
  prompt: `Eres un experto asesor laboral en España. Analiza la siguiente nómina generada (en formato JSON) y proporciona una explicación clara y sencilla de cómo se ha calculado cada uno de los conceptos clave.

**Datos de la Nómina a Revisar:**
\`\`\`json
{{{JSON.stringify payrollData}}}
\`\`\`

**Tu Tarea:**
Genera una lista de explicaciones ('explanations') para los conceptos más importantes de la nómina proporcionada. Para cada concepto ('concept'), explica de dónde sale el valor ('explanation'). Por ejemplo:
-   **Salario Base:** "Se calcula dividiendo el salario bruto anual entre 12 pagas."
-   **Contingencias Comunes:** "Es el 4.80% de la Base de Cotización de Contingencias Comunes (BCCC)."
-   **Retención IRPF:** "Es el resultado de aplicar el porcentaje de retención (ej. 18%) a la base de IRPF (total devengado)."
-   **Líquido a Percibir:** "Es el resultado de restar el Total a Deducir del Total Devengado."

Sé claro, conciso y utiliza un lenguaje fácil de entender para alguien que no es experto en nóminas. Basa tus explicaciones en los datos concretos de la nómina proporcionada. Responde SIEMPRE en español y ÚNICAMENTE con el formato JSON requerido.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const reviewPayrollFlow = ai.defineFlow(
  {
    name: 'reviewPayrollFlow',
    inputSchema: ReviewPayrollInputSchema,
    outputSchema: ReviewPayrollOutputSchema,
  },
  async (input: ReviewPayrollInput) => { // Añadimos tipo a input
    try {
      // 1. Llamamos al prompt especificando el modelo
      const { output } = await prompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'), // Modelo añadido aquí
      });

      // 2. Validamos la salida con safeParse
      const parsed = ReviewPayrollOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de Zod en reviewPayroll:', parsed.error);
        throw new Error('La IA ha devuelto la explicación de la nómina con formato inesperado.');
      }
      
      return parsed.data; // Devolvemos los datos validados

    } catch (error) {
      // 3. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en reviewPayrollFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudo generar la explicación de la nómina. Error: ${message}`);
    }
  }
);
