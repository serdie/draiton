'use server';

import { fiscalAssistant, type FiscalAssistantOutput } from '@/ai/flows/fiscal-assistant';

export async function getFiscalAdviceAction(
  currentState: { output: FiscalAssistantOutput | null; error: string | null },
  formData: FormData
): Promise<{ output: FiscalAssistantOutput | null; error: string | null }> {
  const model = formData.get('taxModel') as any;
  const incomeStr = formData.get('income') as string;
  const expensesStr = formData.get('expenses') as string;

  if (!model || !incomeStr || !expensesStr) {
    return { output: null, error: "Por favor, completa todos los campos obligatorios." };
  }

  const income = parseFloat(incomeStr);
  const expenses = parseFloat(expensesStr);

  if (isNaN(income) || isNaN(expenses)) {
      return { output: null, error: "Los importes de ingresos y gastos deben ser números válidos." };
  }

  try {
    const result = await fiscalAssistant({ 
        taxModel: model,
        income: income,
        expenses: expenses,
        notes: formData.get('notes') as string,
     });
    return { output: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { output: null, error: "Ha ocurrido un error al generar la ayuda. Inténtalo de nuevo." };
  }
}
