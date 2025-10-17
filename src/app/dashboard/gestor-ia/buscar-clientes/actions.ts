
'use server';

import { findPotentialClients, type FindPotentialClientsOutput } from '@/ai/flows/find-potential-clients';

export async function findPotentialClientsAction(
  currentState: { output: FindPotentialClientsOutput | null; error: string | null },
  formData: FormData
): Promise<{ output: FindPotentialClientsOutput | null; error: string | null }> {
  const productsAndServices = formData.get('productsAndServices') as string;
  const existingClientProfile = formData.get('existingClientProfile') as string;
  const companyLocation = formData.get('companyLocation') as string;

  if (!productsAndServices || !existingClientProfile || !companyLocation) {
    return { output: null, error: "Por favor, completa todos los campos del perfil." };
  }
  
  try {
    const result = await findPotentialClients({
        productsAndServices,
        existingClientProfile,
        companyLocation,
    });
    return { output: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { output: null, error: `Error de la IA: ${e.message}` };
  }
}
