'use server';

import { findCollectiveAgreement, type FindCollectiveAgreementInput, type FindCollectiveAgreementOutput } from '@/ai/flows/find-collective-agreement';


export async function findCollectiveAgreementAction(
  currentState: { output: FindCollectiveAgreementOutput | null; error: string | null },
  formData: FormData
): Promise<{ output: FindCollectiveAgreementOutput | null; error: string | null }> {
  const scope = formData.get('scope') as FindCollectiveAgreementInput['scope'];
  const region = formData.get('region') as string;
  const province = formData.get('province') as string;
  const sectorKeyword = formData.get('sectorKeyword') as string;

  if (!scope || !sectorKeyword) {
    return { output: null, error: "El ámbito y el sector son campos obligatorios." };
  }
  
  try {
    const result = await findCollectiveAgreement({
        scope,
        region,
        province,
        sectorKeyword
    });
    return { output: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { output: null, error: `Error de la IA: ${e.message}` };
  }
}
