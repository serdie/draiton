import { aiPoweredWebManagement, AIPoweredWebManagementOutput } from '@/ai/flows/ai-powered-web-management';
import { GestorWebForm } from '../gestor-web-ia/gestor-web-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WebIAPage() {
  
  async function getWebsiteConcept(
    currentState: { output: AIPoweredWebManagementOutput | null; error: string | null },
    formData: FormData
  ): Promise<{ output: AIPoweredWebManagementOutput | null; error: string | null }> {
    "use server";
    
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Web IA</h1>
        <p className="text-muted-foreground">
          Crea y gestiona tu página web, tienda online o landing page con IA. Describe tu negocio y preferencias, y deja que la IA haga el resto.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crear mi sitio web</CardTitle>
          <CardDescription>Proporciona los detalles para que la IA pueda generar un concepto a tu medida.</CardDescription>
        </CardHeader>
        <CardContent>
          <GestorWebForm action={getWebsiteConcept} />
        </CardContent>
      </Card>
    </div>
  );
}
