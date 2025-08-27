
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, FileEdit, Bot, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

function ProFeatureLock() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
      <Card className="max-w-md text-center">
        <CardContent className="p-8">
          <Lock className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-2xl font-semibold">Función Exclusiva del Plan Pro</h3>
          <p className="mt-2 text-muted-foreground">
            Accede a tu gestor IA personalizado para recibir ayudas y simplificar trámites.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GestorIAPage() {
  const { isPro } = useContext(AuthContext);

  return (
    <div className="relative">
      {!isPro && <ProFeatureLock />}
      <div className={cn("space-y-8", !isPro && "opacity-50 pointer-events-none")}>
        <div>
          <h1 className="text-3xl font-bold">Gestor Inteligente de Negocio</h1>
          <p className="text-muted-foreground">
            Tu copiloto de IA para tomar mejores decisiones, automatizar tareas y hacer crecer tu negocio.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="flex flex-col">
                <CardHeader>
                     <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Ideas de Negocio</CardTitle>
                    </div>
                    <CardDescription className="pt-2">Analiza tu empresa y recibe sugerencias para mejorar tu oferta y comercialización.</CardDescription>
                </CardHeader>
                 <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">Introduce los datos de tu compañía y deja que la IA te inspire.</p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full">
                        <Link href="/dashboard/asistente-ia">Analizar mi Negocio <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
            </Card>

             <Card className="flex flex-col">
                <CardHeader>
                     <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <FileEdit className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Asistente Fiscal</CardTitle>
                    </div>
                    <CardDescription className="pt-2">Recibe instrucciones claras y precisas para rellenar tus modelos de impuestos.</CardDescription>
                </CardHeader>
                 <CardContent className="flex-grow">
                     <p className="text-sm text-muted-foreground">Simplifica tus obligaciones tributarias con la ayuda de la IA.</p>
                </CardContent>
                <CardFooter>
                     <Button asChild className="w-full">
                        <Link href="/dashboard/gestor-ia/asistente-fiscal">Preparar Impuestos <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
            </Card>

             <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Newspaper className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>Buscador de Ayudas</CardTitle>
                    </div>
                    <CardDescription className="pt-2">Encuentra subvenciones y noticias relevantes para tu sector y localización.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">La IA busca oportunidades para ti en el BOE y otras fuentes oficiales.</p>
                </CardContent>
                <CardFooter>
                     <Button asChild className="w-full">
                        <Link href="/dashboard/gestor-ia/ayudas">Buscar Oportunidades <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
