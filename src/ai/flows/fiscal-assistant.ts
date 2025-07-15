'use server';

/**
 * @fileOverview A Genkit flow to assist with filling out Spanish tax forms.
 *
 * - fiscalAssistant - A function that provides instructions for a specific tax form.
 * - FiscalAssistantInput - The input type for the fiscalAssistant function.
 * - FiscalAssistantOutput - The return type for the fiscalAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FiscalAssistantInputSchema = z.object({
  taxModel: z.enum(['Modelo 303 (IVA)', 'Modelo 130 (IRPF)', 'Modelo 111 (Retenciones)', 'Modelo 347 (Operaciones con terceros)']).describe('The specific Spanish tax form the user needs help with.'),
  income: z.number().describe('Total income (base amount, without taxes) for the period.'),
  expenses: z.number().describe('Total deductible expenses (base amount, without taxes) for the period.'),
  notes: z.string().optional().describe('Any additional notes or specific questions the user has.'),
});
export type FiscalAssistantInput = z.infer<typeof FiscalAssistantInputSchema>;

const FiscalAssistantOutputSchema = z.object({
    modelSummary: z.string().describe('A brief summary of what this tax model is for.'),
    instructions: z.array(z.object({
        field: z.string().describe('The name or number of the field/box in the form.'),
        value: z.string().describe('The calculated value or data that should be entered in the field.'),
        explanation: z.string().describe('A clear explanation of how the value was calculated or what it represents.'),
    })).describe('A step-by-step list of instructions for filling out the most important fields of the form.'),
    finalResult: z.string().describe('The final result of the form (e.g., "A pagar", "A devolver", "A compensar").'),
    importantNotes: z.string().describe('Key considerations, deadlines, or warnings related to this tax model.'),
});
export type FiscalAssistantOutput = z.infer<typeof FiscalAssistantOutputSchema>;

export async function fiscalAssistant(input: FiscalAssistantInput): Promise<FiscalAssistantOutput> {
  return fiscalAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fiscalAssistantPrompt',
  input: { schema: FiscalAssistantInputSchema },
  output: { schema: FiscalAssistantOutputSchema },
  prompt: `You are an expert tax advisor in Spain. A user needs help filling out a tax form. Your task is to provide clear, step-by-step instructions based on the data they provide.

**User's Data:**
- Tax Model: {{{taxModel}}}
- Total Income (Base): {{{income}}}
- Total Expenses (Base): {{{expenses}}}
- Additional Notes: {{{notes}}}

**Your Task:**
1.  **Model Summary**: Briefly explain the purpose of the selected tax model.
2.  **Instructions**: Based on the income and expense data, calculate the key figures and provide a step-by-step guide for the most important fields of the form. For each field, specify the field name/number, the value to enter, and a simple explanation. Assume a standard VAT rate of 21% for IVA calculations (Modelo 303) and a standard IRPF rate of 20% on net profit for IRPF calculations (Modelo 130).
3.  **Final Result**: Clearly state the final outcome (e.g., amount to pay, amount to be returned).
4.  **Important Notes**: Add any crucial advice, such as deadlines or common mistakes to avoid.

Respond ONLY in Spanish. Be clear, concise, and professional. The goal is to simplify the process for the user.`,
});

const fiscalAssistantFlow = ai.defineFlow(
  {
    name: 'fiscalAssistantFlow',
    inputSchema: FiscalAssistantInputSchema,
    outputSchema: FiscalAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
