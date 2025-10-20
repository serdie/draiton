'use server';

import { businessAssistant } from '@/ai/flows/business-assistant-flow';
import { type MessageData } from 'genkit/model';
import { generateBusinessIdeas, GenerateBusinessIdeasOutput } from '@/ai/flows/generate-business-ideas';

export async function askBusinessAssistantAction(
    history: MessageData[],
    message: string,
    documentContent: string | null
): Promise<{ response: string | null; error: string | null; }> {
    try {
        const result = await businessAssistant({ history, message, documentContent });
        return { response: result.response, error: null };
    } catch (e: any) {
        console.error(e);
        return { response: null, error: 'Ha ocurrido un error al contactar al asistente. Inténtalo de nuevo.' };
    }
}