
'use server';

import { ai } from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import { 
    ReviewPayrollInputSchema,
    ReviewPayrollOutputSchema,
    type ReviewPayrollInput,
    type ReviewPayrollOutput 
} from '@/ai/schemas/payroll-schemas';

export async function reviewPayroll(input: ReviewPayrollInput): Promise<ReviewPayrollOutput> {
    return reviewPayrollFlow(input);
}


const prompt = ai.definePrompt({
  name: 'reviewPayrollPrompt',
  input: { schema: ReviewPayrollInputSchema },
  output: { schema: ReviewPayrollOutputSchema },
  prompt: `Eres un experto asesor laboral en España. Analiza la siguiente nómina generada y proporciona una explicación clara y sencilla de cómo se ha calculado cada uno de los conceptos clave.

**Datos de la Nómina a Revisar:**
\`\`\`json
{{JSON.stringify payrollData}}
\`\`\`

**Tu Tarea:**
Genera una lista de explicaciones para los conceptos más importantes. Para cada concepto, explica de dónde sale el valor. Por ejemplo:
-   **Salario Base:** "Se calcula dividiendo el salario bruto anual entre 12 pagas."
-   **Contingencias Comunes:** "Es el 4.80% de la Base de Cotización de Contingencias Comunes (BCCC)."
-   **Retención IRPF:** "Es el resultado de aplicar el porcentaje de retención (ej. 18%) a la base de IRPF (total devengado)."
-   **Líquido a Percibir:** "Es el resultado de restar el Total a Deducir del Total Devengado."

Sé claro, conciso y utiliza un lenguaje fácil de entender para alguien que no es experto en nóminas. Responde en español.`,
});


const reviewPayrollFlow = ai.defineFlow(
  {
    name: 'reviewPayrollFlow',
    inputSchema: ReviewPayrollInputSchema,
    outputSchema: ReviewPayrollOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: prompt.template,
      model: googleAI.model('gemini-2.5-flash-lite'),
      output: { schema: ReviewPayrollOutputSchema },
      context: [
        {
          role: 'user',
          content: [{ text: JSON.stringify(input) }],
        },
      ],
    });
    return output!;
  }
);
