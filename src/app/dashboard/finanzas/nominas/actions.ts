
'use server';

import { generatePayroll } from '@/ai/flows/generate-payroll';
import { type GeneratePayrollInput, type GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';

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
