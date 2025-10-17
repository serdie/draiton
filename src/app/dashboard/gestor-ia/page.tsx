
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Sparkles, Lightbulb, MonitorCog, ScanLine, LineChart, Zap, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessIdeasForm } from './ideas-negocio/ideas-form';
import { getBusinessIdeasAction } from './ideas-negocio/actions';
import { AyudasForm } from './ayudas/ayudas-form';
import { getGrantsAndNewsAction } from './ayudas/actions';
import WebIAPage from '../web-ia/page';
import MarketingIAPage from '../marketing-ia/page';
import AutomatizacionesPage from '../automatizaciones/page';
import { BuscarClientesForm } from './buscar-clientes/buscar-clientes-form';
import { findPotentialClientsAction } from './buscar-clientes/actions';


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
          <h1 className="text-3xl font-bold">Herramientas de Inteligencia Artificial</h1>
          <p className="text-muted-foreground">
            Tu copiloto de IA para tomar mejores decisiones, automatizar tareas y hacer crecer tu negocio.
          </p>
        </div>
        
        <Tabs defaultValue="perspectivas" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="perspectivas"><Lightbulb className="mr-2 h-4 w-4" />Perspectivas</TabsTrigger>
                <TabsTrigger value="marketing-ia"><LineChart className="mr-2 h-4 w-4" />Marketing IA</TabsTrigger>
                <TabsTrigger value="web-ia"><MonitorCog className="mr-2 h-4 w-4" />Web IA</TabsTrigger>
                <TabsTrigger value="automatizaciones"><Zap className="mr-2 h-4 w-4" />Automatización</TabsTrigger>
            </TabsList>
            <div className="mt-6">
                <TabsContent value="perspectivas">
                    <Tabs defaultValue="ideas">
                        <TabsList>
                             <TabsTrigger value="ideas">Ideas de Negocio</TabsTrigger>
                             <TabsTrigger value="ayudas">Buscador de Ayudas</TabsTrigger>
                             <TabsTrigger value="buscar-clientes">Buscar Clientes</TabsTrigger>
                        </TabsList>
                        <TabsContent value="ideas" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Perspectivas de Negocio</CardTitle>
                                    <CardDescription>Describe tu empresa, productos, servicios y mercado. Nuestra IA analizará los datos y te dará ideas para mejorar tu comercialización y oferta.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <BusinessIdeasForm action={getBusinessIdeasAction} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="ayudas" className="mt-4">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Buscador de Ayudas y Noticias</CardTitle>
                                    <CardDescription>Cuantos más detalles proporciones, más precisa será la búsqueda de la IA en fuentes oficiales y medios de comunicación.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <AyudasForm action={getGrantsAndNewsAction} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="buscar-clientes" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Buscador de Clientes Potenciales</CardTitle>
                                    <CardDescription>Describe tus productos y tu cliente ideal para que la IA encuentre nuevas oportunidades de negocio.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <BuscarClientesForm action={findPotentialClientsAction} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </TabsContent>
                <TabsContent value="marketing-ia">
                    <MarketingIAPage />
                </TabsContent>
                 <TabsContent value="web-ia">
                    <WebIAPage />
                </TabsContent>
                 <TabsContent value="automatizaciones">
                     <AutomatizacionesPage />
                </TabsContent>
            </div>
        </Tabs>
      </div>
    </div>
  );
}
