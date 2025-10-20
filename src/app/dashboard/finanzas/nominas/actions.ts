
'use server';

import { generatePayroll } from '@/ai/flows/generate-payroll';
import { type GeneratePayrollInput, type GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import { reviewPayroll, type ReviewPayrollInput, type ReviewPayrollOutput } from '@/ai/flows/review-payroll';
import { businessAssistant } from '@/ai/flows/business-assistant-flow';
import { type MessageData } from 'genkit/model';


export async function askBusinessAssistantAction(
    history: MessageData[],
    message: string,
    documentContent: string | null
): Promise<{ response: string | null; error: string | null; }> {
    try {
        const result = await businessAssistant({ history, message, documentContent });
        return { response: result.response, error: null };
    } catch (e: any) {
        console.error(e);
        return { response: null, error: 'Ha ocurrido un error al contactar al asistente. Inténtalo de nuevo.' };
    }
}

export async function generatePayrollAction(
  input: GeneratePayrollInput
): Promise<{ data: GeneratePayrollOutput | null; error: string | null }> {
  try {
    const result = await generatePayroll(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('Error in generatePayrollAction:', e);
    return { data: null, error: 'No se pudo generar la nómina. Revisa los datos y vuelve a intentarlo.' };
  }
}

export async function reviewPayrollAction(
    input: ReviewPayrollInput
): Promise<{ data: ReviewPayrollOutput | null; error: string | null }> {
    try {
        const result = await reviewPayroll(input);
        return { data: result, error: null };
    } catch (e: any) {
        console.error('Error in reviewPayrollAction:', e);
        return { data: null, error: 'La IA no pudo revisar la nómina. Inténtalo de nuevo.' };
    }
}
