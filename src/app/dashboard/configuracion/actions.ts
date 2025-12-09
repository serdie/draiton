
'use server';

import { findCollectiveAgreement } from '@/ai/flows/find-collective-agreement';
import type { FindCollectiveAgreementInput, FindCollectiveAgreementOutput } from '@/ai/schemas/collective-agreement-schemas';


export async function findCollectiveAgreementAction(
  currentState: { output: FindCollectiveAgreementOutput | null; error: string | null },
  formData: FormData
): Promise<{ output: FindCollectiveAgreementOutput | null; error: string | null }> {
  
  const scope = formData.get('scope') as FindCollectiveAgreementInput['scope'];
  const region = formData.get('region') as string | null;
  const province = formData.get('province') as string | null;
  const sectorKeyword = formData.get('sectorKeyword') as string;

  if (!scope || !sectorKeyword) {
    return { output: null, error: "El ámbito y el sector son campos obligatorios." };
  }
  
  const input: FindCollectiveAgreementInput = {
    scope,
    sectorKeyword,
  };

  if (region) {
    input.region = region;
  }
  if (province) {
    input.province = province;
  }
  
  try {
    const result = await findCollectiveAgreement(input);
    return { output: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { output: null, error: `Error de la IA: ${e.message}` };
  }
}
