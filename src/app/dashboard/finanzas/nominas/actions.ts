
'use server';

import { generatePayroll, type GeneratePayrollInput, type GeneratePayrollOutput } from '@/ai/flows/generate-payroll';
import { reviewPayroll, type ReviewPayrollOutput } from '@/ai/flows/review-payroll';

export async function generatePayrollAction(
  input: GeneratePayrollInput
): Promise<{ data: GeneratePayrollOutput | null; error: string | null }> {
  try {
    const result = await generatePayroll(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('Error in generatePayrollAction:', e);
    return { data: null, error: `Error de la IA: ${e.message}` };
  }
}

export async function reviewPayrollAction(
    payrollData: GeneratePayrollOutput
): Promise<{ data: ReviewPayrollOutput | null; error: string | null; }> {
     try {
        const result = await reviewPayroll({ payrollData });
        return { data: result, error: null };
    } catch (e: any) {
        console.error('Error in reviewPayrollAction:', e);
        return { data: null, error: `Error de la IA: ${e.message}` };
    }
}
