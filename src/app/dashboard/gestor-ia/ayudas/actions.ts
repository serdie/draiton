'use server';

import { findGrantsAndNews, type FindGrantsAndNewsOutput } from '@/ai/flows/find-grants-and-news';
import { generateGrantTutorial, type GenerateGrantTutorialInput, type GenerateGrantTutorialOutput } from '@/ai/flows/generate-grant-tutorial';


export async function getGrantsAndNewsAction(
  currentState: { output: FindGrantsAndNewsOutput | null; error: string | null },
  formData: FormData
): Promise<{ output: FindGrantsAndNewsOutput | null; error: string | null }> {
  const businessSector = formData.get('businessSector') as string;
  const businessLocation = formData.get('businessLocation') as string;
  const employeeCountStr = formData.get('employeeCount') as string;
  const businessDescription = formData.get('businessDescription') as string;

  if (!businessSector || !businessLocation || !employeeCountStr || !businessDescription) {
    return { output: null, error: "Por favor, completa todos los campos del perfil de negocio." };
  }
  
  const employeeCount = parseInt(employeeCountStr, 10);
   if (isNaN(employeeCount)) {
    return { output: null, error: "El número de empleados debe ser un número válido." };
  }

  try {
    const result = await findGrantsAndNews({
        businessSector,
        businessLocation,
        employeeCount,
        businessDescription
    });
    return { output: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { output: null, error: `Error de la IA: ${e.message}` };
  }
}


export async function getGrantTutorialAction(
  input: GenerateGrantTutorialInput
): Promise<{ data: GenerateGrantTutorialOutput | null; error: string | null }> {
  try {
    const result = await generateGrantTutorial(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error('Error generating tutorial:', e);
    return { data: null, error: 'No se pudo generar el tutorial. Inténtalo de nuevo más tarde.' };
  }
}
