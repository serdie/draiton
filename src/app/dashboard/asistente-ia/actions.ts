
'use server';

import { businessAssistant } from '@/ai/flows/business-assistant-flow';
import { type MessageData } from 'genkit/model';
import { generateBusinessIdeas, GenerateBusinessIdeasOutput } from '@/ai/flows/generate-business-ideas';

export async function askBusinessAssistantAction(
    history: MessageData[],
    message: string
): Promise<{ response: string | null; error: string | null; }> {
    try {
        const result = await businessAssistant({ history, message });
        return { response: result.response, error: null };
    } catch (e: any) {
        console.error(e);
        return { response: null, error: 'Ha ocurrido un error al contactar al asistente. Inténtalo de nuevo.' };
    }
}

export async function getBusinessIdeas(
    currentState: { output: GenerateBusinessIdeasOutput | null; error: string | null },
    formData: FormData
  ): Promise<{ output: GenerateBusinessIdeasOutput | null; error: string | null }> {
    "use server";
    
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
