
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, FileEdit, Bot, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PerspectivasIAPage from '../perspectivas-ia/page';
import MarketingIAPage from '../marketing-ia/page';
import WebIAPage from '../web-ia/page';


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

const PerspectiveCard = ({ title, icon, children, actionText, actionLink }: { title: string, icon: React.ReactNode, children: React.ReactNode, actionText: string, actionLink: string }) => (
    <Card className="bg-secondary/50 border-border/30">
        <CardHeader className="flex flex-row justify-between items-start">
            <h3 className="font-semibold">{title}</h3>
            <div className="text-primary">{icon}</div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground text-sm">{children}</p>
        </CardContent>
        <CardFooter>
            <Button variant="link" asChild className="p-0">
                <Link href={actionLink}>{actionText}</Link>
            </Button>
        </CardFooter>
    </Card>
)

export default function GestorIAPage() {
  const { isPro } = useContext(AuthContext);

  return (
    <div className="relative">
      {!isPro && <ProFeatureLock />}
      <div className={cn("space-y-8", !isPro && "opacity-50 pointer-events-none")}>
        <div>
          <h1 className="text-3xl font-bold">Herramientas de Inteligencia Artificial</h1>
          <p className="text-muted-foreground">
            Potencia tu negocio con herramientas diseñadas para crecer.
          </p>
        </div>
        
        <Tabs defaultValue="perspectivas" className="w-full">
            <TabsList className="border-b border-border/50 rounded-none p-0 bg-transparent justify-start gap-4">
                <TabsTrigger value="perspectivas" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-1">Perspectivas</TabsTrigger>
                <TabsTrigger value="marketing" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-1">Marketing IA</TabsTrigger>
                <TabsTrigger value="web" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-1">Web IA</TabsTrigger>
            </TabsList>
            <TabsContent value="perspectivas" className="mt-6 space-y-6">
                <PerspectiveCard title="Aumento de Gastos en Software" icon={<Sparkles />} actionText="Analizar Alternativas" actionLink="/dashboard/gastos">
                    Detectamos un aumento del 20% en gastos de software este trimestre, principalmente en herramientas de diseño. ¿Quieres que la IA analice alternativas más económicas con funcionalidades similares?
                </PerspectiveCard>
                <PerspectiveCard title="Oportunidad de Subvención" icon={<Newspaper />} actionText="Ver Requisitos" actionLink="/dashboard/gestor-ia/ayudas">
                    Hemos encontrado una nueva subvención ('InnoCámaras 2024') para digitalización a la que tu empresa podría aplicar. La fecha límite para la solicitud es el 30/09/2024.
                </PerspectiveCard>
                <PerspectiveCard title="Cliente con Mayor Rentabilidad" icon={<Sparkles />} actionText="Ver Ficha de Cliente" actionLink="/dashboard/contactos">
                    El cliente 'Innovate LLC' ha generado el mayor margen de beneficio este año. Podría ser un buen momento para proponerles un nuevo proyecto o un contrato de mantenimiento.
                </PerspectiveCard>
            </TabsContent>
            <TabsContent value="marketing" className="mt-6">
                 <MarketingIAPage />
            </TabsContent>
            <TabsContent value="web" className="mt-6">
                 <WebIAPage />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
