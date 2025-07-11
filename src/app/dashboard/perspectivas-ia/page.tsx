
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { generateBusinessIdeas, GenerateBusinessIdeasOutput } from '@/ai/flows/generate-business-ideas';
import { AsistenteForm } from '../asistente-ia/asistente-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PerspectivasIAPage() {
  const { user } = useContext(AuthContext);
  const isProUser = user?.role === 'pro' || user?.role === 'admin';
  
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
        <h1 className="text-3xl font-bold">Perspectivas IA</h1>
        <p className="text-muted-foreground">
          Describe tu empresa, productos, servicios y mercado. Nuestra IA analizará los datos y te dará ideas para mejorar tu comercialización y oferta.
        </p>
      </div>

      {!isProUser && (
        <Card className="border-primary/50 bg-primary/10">
          <CardHeader>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Función Exclusiva del Plan Pro</CardTitle>
                    <CardDescription className="text-primary/90">
                      Analiza tu negocio con IA para descubrir nuevas oportunidades de crecimiento.
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-primary/80">
              Actualiza al plan Pro para recibir sugerencias personalizadas sobre comercialización, productos y estrategias de mercado.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card className={cn(!isProUser && "opacity-50 pointer-events-none")}>
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
