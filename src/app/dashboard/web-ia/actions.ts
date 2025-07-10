
'use server';

import { aiPoweredWebManagement, AIPoweredWebManagementOutput } from '@/ai/flows/ai-powered-web-management';

export async function getWebsiteConceptAction(
    currentState: { output: AIPoweredWebManagementOutput | null; error: string | null },
    formData: FormData
): Promise<{ output: AIPoweredWebManagementOutput | null; error: string | null }> {
    try {
        const input = {
            businessDescription: formData.get('businessDescription') as string,
            websiteType: formData.get('websiteType') as 'website' | 'online store' | 'landing page',
            designPreferences: formData.get('designPreferences') as string,
            exampleWebsites: formData.get('exampleWebsites') as string,
            additionalFeatures: formData.get('additionalFeatures') as string,
        };

        if (!input.businessDescription || !input.websiteType) {
            return { output: null, error: "La descripción del negocio y el tipo de sitio son obligatorios." };
        }

        const result = await aiPoweredWebManagement(input);
        return { output: result, error: null };
    } catch (e: any) {
        console.error(e);
        return { output: null, error: "Ha ocurrido un error al generar el concepto. Inténtalo de nuevo." };
    }
}
