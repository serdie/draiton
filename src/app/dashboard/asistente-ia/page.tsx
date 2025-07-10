import { generateBusinessIdeas, GenerateBusinessIdeasOutput } from '@/ai/flows/generate-business-ideas';
import { AsistenteForm } from './asistente-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AsistenteIAPage() {
  
  async function getBusinessIdeas(
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Asistente IA para Negocios</h1>
        <p className="text-muted-foreground">
          Describe tu empresa, productos, servicios y mercado. Nuestra IA analizará los datos y te dará ideas para mejorar tu comercialización y oferta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analizar mi negocio</CardTitle>
          <CardDescription>Cuantos más detalles proporciones, mejores serán las sugerencias.</CardDescription>
        </CardHeader>
        <CardContent>
          <AsistenteForm action={getBusinessIdeas} />
        </CardContent>
      </Card>
    </div>
  );
}
