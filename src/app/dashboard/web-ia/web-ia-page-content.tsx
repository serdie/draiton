
'use client';

import { useState } from 'react';
import { GestorWebForm } from './gestor-web-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonitorCog, PlusCircle } from 'lucide-react';
import type { AIPoweredWebManagementOutput } from '@/ai/flows/ai-powered-web-management';
import { ConnectSiteModal } from './connect-site-modal';


type GetWebsiteConceptAction = (
    currentState: { output: AIPoweredWebManagementOutput | null; error: string | null },
    formData: FormData
) => Promise<{ output: AIPoweredWebManagementOutput | null; error: string | null }>;


export function WebIAPageContent({ getWebsiteConceptAction }: { getWebsiteConceptAction: GetWebsiteConceptAction }) {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  return (
    <>
    <ConnectSiteModal isOpen={isConnectModalOpen} onClose={() => setIsConnectModalOpen(false)} />
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Gestor Web con IA</h1>
        <p className="text-muted-foreground">
          Crea y gestiona tu página web, tienda online o landing page con IA. Describe tu negocio y preferencias, y deja que la IA haga el resto.
        </p>
      </div>
      
      <Tabs defaultValue="crear" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="crear">Crear Nuevo Sitio</TabsTrigger>
            <TabsTrigger value="gestionar">Gestionar Sitios Existentes</TabsTrigger>
        </TabsList>
        <TabsContent value="crear" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Crear un nuevo sitio web</CardTitle>
              <CardDescription>Proporciona los detalles para que la IA pueda generar un concepto a tu medida.</CardDescription>
            </CardHeader>
            <CardContent>
              <GestorWebForm action={getWebsiteConceptAction} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gestionar" className="mt-6">
           <div className="space-y-6">
                <Card className="min-h-[400px]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Mis Sitios Web</CardTitle>
                      <CardDescription>Gestiona tus sitios generados y externos.</CardDescription>
                    </div>
                     <Button variant="outline" onClick={() => setIsConnectModalOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Conectar Sitio Externo
                    </Button>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                      <MonitorCog className="h-16 w-16 mb-4" />
                      <p>Aún no has generado ni conectado ningún sitio web.</p>
                      <p className="text-sm">Usa los botones de arriba para empezar.</p>
                  </CardContent>
                </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
