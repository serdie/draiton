
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GeneratePayrollOutputSchema } from '@/ai/schemas/payroll-schemas';

export const ReviewPayrollInputSchema = z.object({
    payrollData: GeneratePayrollOutputSchema.describe('The full JSON data of the generated payroll to be reviewed.'),
});
export type ReviewPayrollInput = z.infer<typeof ReviewPayrollInputSchema>;

const ExplanationStepSchema = z.object({
    concept: z.string().describe('The payroll concept being explained (e.g., "Salario Base", "Retención IRPF").'),
    explanation: z.string().describe('A clear and simple explanation of how this value was calculated or what it means.'),
});

export const ReviewPayrollOutputSchema = z.object({
  explanations: z.array(ExplanationStepSchema).describe('A list of step-by-step explanations for the payroll calculation.'),
});
export type ReviewPayrollOutput = z.infer<typeof ReviewPayrollOutputSchema>;


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
{{{jsonStringify payrollData}}}
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
    const { output } = await prompt({
        payrollData: input.payrollData,
        // Helper to stringify JSON in the prompt
        jsonStringify: (obj: any) => JSON.stringify(obj, null, 2),
    });
    return output!;
  }
);
