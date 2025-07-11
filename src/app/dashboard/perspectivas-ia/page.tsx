
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { AsistenteForm } from '../asistente-ia/asistente-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { getBusinessIdeasAction } from './actions';
import { cn } from '@/lib/utils';


function ProFeatureLock() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
      <Card className="max-w-md text-center">
        <CardContent className="p-8">
          <Lock className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-2xl font-semibold">Función Exclusiva del Plan Pro</h3>
          <p className="mt-2 text-muted-foreground">
            Obtén ideas y sugerencias de la IA para mejorar tu negocio.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function PerspectivasIAPage() {
  const { isPro } = useContext(AuthContext);

  return (
    <div className="relative">
      {!isPro && <ProFeatureLock />}
      <div className={cn("space-y-6", !isPro && "opacity-50 pointer-events-none")}>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Perspectivas IA</h1>
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
            <AsistenteForm action={getBusinessIdeasAction} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
