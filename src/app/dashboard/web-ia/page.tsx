
'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { WebIAPageContent } from './web-ia-page-content';
import { getWebsiteConceptAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WebIAPage() {
  const { user } = useContext(AuthContext);
  const isProUser = user?.role === 'pro' || user?.role === 'admin';

  return (
    <div className="space-y-6">
       <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tu Asistente Web Inteligente</h1>
          <p className="text-muted-foreground">
            Crea y administra tu presencia online: sitios web, tiendas online y landing pages con el poder de la IA.
          </p>
        </div>
      </div>
      
      {!isProUser ? (
        <Card className="border-primary/50 bg-primary/10">
          <CardHeader>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                    <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>Función Exclusiva del Plan Pro</CardTitle>
                    <CardDescription className="text-primary/90">
                      Crea y administra tu presencia online con el poder de la inteligencia artificial.
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-primary/80">
              Actualiza al plan Pro para crear sitios web, tiendas online y landing pages ilimitadas con nuestro asistente inteligente.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <div className={cn(!isProUser ? "opacity-50 pointer-events-none" : "")}>
        <WebIAPageContent getWebsiteConceptAction={getWebsiteConceptAction} />
      </div>

    </div>
  );
}
