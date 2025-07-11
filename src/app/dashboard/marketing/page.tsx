
'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Users, Zap, Lock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function MarketingPage() {
  const { user } = useContext(AuthContext);
  const isProUser = user?.role === 'pro' || user?.role === 'admin';

  if (!isProUser) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center bg-primary/10 p-3 rounded-full mb-4 mx-auto w-fit">
                <Lock className="h-6 w-6 text-primary" />
              </div>
          <CardTitle>Función Exclusiva del Plan Pro</CardTitle>
          <CardDescription>
            El Centro de Marketing es una herramienta avanzada para potenciar tu negocio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Actualiza al plan Pro para acceder a campañas de email, gestión de redes sociales y automatizaciones de marketing.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="/dashboard/configuracion?tab=suscripcion">Ver Planes</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Centro de Marketing</h1>
        <p className="text-muted-foreground">
          Gestiona tus campañas de correo electrónico, boletines y presencia en redes sociales.
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
             <Badge variant="outline">Función próximamente</Badge>
          </CardContent>
          <CardFooter>
            <Button variant="outline" disabled>Crear Campaña de Correo</Button>
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
             <Badge variant="outline">Función próximamente</Badge>
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
            <Badge variant="outline">Funciones avanzadas planeadas</Badge>
          </CardContent>
          <CardFooter>
             <Button asChild>
                <Link href="/dashboard/automatizaciones">Explorar Automatizaciones</Link>
            </Button>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
