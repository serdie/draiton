
'use client';

import { AsistenteForm } from '../asistente-ia/asistente-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getBusinessIdeasAction } from './actions';

export default function PerspectivasIAPage() {
  return (
    <div className="space-y-6">
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
  );
}
