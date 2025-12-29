'use client';

import { getGrantsAndNewsAction } from './actions';
import { AyudasForm } from './ayudas-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AyudasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/gestor-ia">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Buscador de Ayudas y Noticias</h1>
          <p className="text-muted-foreground">
            Deja que la IA encuentre oportunidades y novedades para tu negocio.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil de tu Negocio</CardTitle>
          <CardDescription>Cuantos más detalles proporciones, más precisa será la búsqueda de la IA.</CardDescription>
        </CardHeader>
        <CardContent>
          <AyudasForm action={getGrantsAndNewsAction} />
        </CardContent>
      </Card>
    </div>
  );
}
