'use client';

import { getFiscalAdviceAction } from './actions';
import { AsistenteFiscalForm } from './asistente-fiscal-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AsistenteFiscalPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/gestor-ia">
                <ArrowLeft className="h-4 w-4" />
            </Link>
            </Button>
            <div>
            <h1 className="text-3xl font-bold">Asistente de Formularios Fiscales</h1>
            <p className="text-muted-foreground">
                Recibe instrucciones claras de la IA para rellenar los modelos más comunes.
            </p>
            </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Analizar Modelo Fiscal</CardTitle>
          <CardDescription>Selecciona el modelo e introduce los datos de tu trimestre para recibir una guía.</CardDescription>
        </CardHeader>
        <CardContent>
          <AsistenteFiscalForm action={getFiscalAdviceAction} />
        </CardContent>
      </Card>
    </div>
  );
}
