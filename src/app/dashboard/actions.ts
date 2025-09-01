
'use server';

import { businessAssistant } from '@/ai/flows/business-assistant-flow';
import { type MessageData } from 'genkit/model';

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
