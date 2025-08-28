

'use client';

import { useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Users, Zap, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function ProFeatureLock() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
      <Card className="max-w-md text-center">
        <CardContent className="p-8">
          <Lock className="mx-auto h-12 w-12 text-primary" />
          <h3 className="mt-4 text-2xl font-semibold">Función Exclusiva del Plan Pro</h3>
          <p className="mt-2 text-muted-foreground">
            Desbloquea las herramientas de marketing para automatizar campañas y gestionar redes sociales.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MarketingIAPage() {
  const { isPro } = useContext(AuthContext);

  return (
    <div className="relative">
      <div className={cn("space-y-6")}>
        <div>
          <h1 className="text-3xl font-bold">Centro de Marketing IA</h1>
          <p className="text-muted-foreground">
            Gestiona tus campañas de correo electrónico, boletines y presencia en redes sociales con ayuda de la IA.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Campañas de Correo Electrónico</CardTitle>
              </div>
              <CardDescription>Automatiza tu marketing por correo electrónico y boletines.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-sm text-muted-foreground">
                Crea, programa y haz seguimiento de potentes campañas de correo electrónico.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/dashboard/marketing/campanas">Gestionar Campañas</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                 <div className="bg-primary/10 p-3 rounded-full">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gestión de Redes Sociales</CardTitle>
              </div>
              <CardDescription>Programa publicaciones e interactúa con tu audiencia.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
               <p className="text-sm text-muted-foreground">
                Un centro para tus actividades en redes sociales.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild>
                  <Link href="/dashboard/redes-sociales">Gestionar Redes Sociales</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-4">
                 <div className="bg-primary/10 p-3 rounded-full">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Automatización Avanzada</CardTitle>
              </div>
              <CardDescription>Explora potentes herramientas de automatización para marketing.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <p className="text-sm text-muted-foreground">
                Automatiza la nutrición de leads, extracción de correos y envíos masivos.
              </p>
            </CardContent>
            <CardFooter>
               <Button asChild>
                  <Link href="/dashboard/automatizaciones">Explorar Automatizaciones</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
