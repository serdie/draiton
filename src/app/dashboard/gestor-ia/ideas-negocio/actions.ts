
'use server';

import { generateBusinessIdeas, GenerateBusinessIdeasOutput } from '@/ai/flows/generate-business-ideas';

export async function getBusinessIdeasAction(
    currentState: { output: GenerateBusinessIdeasOutput | null; error: string | null },
    formData: FormData
  ): Promise<{ output: GenerateBusinessIdeasOutput | null; error: string | null }> {
    
    const companyData = formData.get('companyData') as string;

    if (!companyData) {
      return { output: null, error: "Por favor, introduce la información de tu empresa." };
    }

    try {
      const result = await generateBusinessIdeas({ companyData });
      return { output: result, error: null };
    } catch (e: any) {
      console.error(e);
      return { output: null, error: "Ha ocurrido un error al generar las ideas. Inténtalo de nuevo." };
    }
  }
