
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Newspaper, FileEdit, Bot, Lock } from 'lucide-react';
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
  const { user } = useContext(AuthContext);
  const isProUser = user?.role === 'pro' || user?.role === 'admin';

  return (
    <div className="relative">
      {!isProUser && <ProFeatureLock />}
      <div className={cn("space-y-8", !isProUser && "opacity-50 pointer-events-none")}>
        <div>
          <h1 className="text-3xl font-bold">Gestor IA Personalizado</h1>
          <p className="text-muted-foreground">
            Tu asistente inteligente para navegar el panorama empresarial y fiscal español.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Newspaper className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Noticias y Ayudas Relevantes</CardTitle>
                  <CardDescription>
                    Recibe información actualizada sobre subvenciones, ayudas y noticias importantes para tu sector y tipo de empresa.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                La IA analizará tu perfil y te mostrará solo lo que te interesa. (Función próximamente)
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Ver Novedades Personalizadas</Button>
            </CardFooter>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
               <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileEdit className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Asistente de Formularios Fiscales</CardTitle>
                  <CardDescription>
                    Simplifica la cumplimentación de modelos para la Agencia Tributaria y la Seguridad Social con ayuda de la IA.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">
                Reduce errores y ahorra tiempo en tus trámites administrativos. (Función próximamente)
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Acceder al Asistente Fiscal</Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-6 text-center">
              <div className="inline-flex items-center justify-center bg-background p-3 rounded-full mb-4">
                  <Bot className="h-8 w-8 text-primary"/>
              </div>
            <h3 className="text-xl font-semibold mb-2">¿Cómo funcionará el Gestor IA?</h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              El Gestor IA aprenderá sobre tu negocio (actividad, ubicación, tamaño) para ofrecerte información proactiva y relevante. Desde alertarte sobre una nueva subvención a la que podrías optar, hasta guiarte en los campos de los formularios fiscales más comunes, el Gestor IA será tu aliado.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
