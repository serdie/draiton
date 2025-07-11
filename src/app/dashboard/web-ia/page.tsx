
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { WebIAPageContent } from './web-ia-page-content';
import { getWebsiteConceptAction } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

function ProFeatureLock() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
      <Card className="max-w-md text-center">
        <CardContent className="p-8">
          <Lock className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-2xl font-semibold">Función Exclusiva del Plan Pro</h3>
          <p className="mt-2 text-muted-foreground">
            Crea y gestiona sitios web, tiendas online y landing pages con el poder de la IA.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function WebIAPage() {
  const { user } = useContext(AuthContext);
  const isProUser = user?.role === 'pro' || user?.role === 'admin';

  return (
    <div className="relative">
       {!isProUser && <ProFeatureLock />}
      <div className={cn("space-y-6", !isProUser && "opacity-50 pointer-events-none")}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tu Asistente Web Inteligente</h1>
            <p className="text-muted-foreground">
              Crea y administra tu presencia online: sitios web, tiendas online y landing pages con el poder de la IA.
            </p>
          </div>
        </div>
        
        <WebIAPageContent getWebsiteConceptAction={getWebsiteConceptAction} />

      </div>
    </div>
  );
}
