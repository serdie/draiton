
'use client';

import { GestorWebForm } from './gestor-web-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Eye, MonitorCog } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AIPoweredWebManagementOutput } from '@/ai/flows/ai-powered-web-management';

type GetWebsiteConceptAction = (
    currentState: { output: AIPoweredWebManagementOutput | null; error: string | null },
    formData: FormData
) => Promise<{ output: AIPoweredWebManagementOutput | null; error: string | null }>;


export function WebIAPageContent({ getWebsiteConceptAction }: { getWebsiteConceptAction: GetWebsiteConceptAction }) {

  return (
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
                  <CardHeader>
                    <CardTitle>Mis Sitios Web Generados</CardTitle>
                    <CardDescription>Los sitios que crees aparecerán aquí.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
                      <MonitorCog className="h-16 w-16 mb-4" />
                      <p>Aún no has generado ningún sitio web.</p>
                      <p className="text-sm">Ve a la pestaña "Crear Nuevo Sitio" para empezar.</p>
                  </CardContent>
                </Card>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
