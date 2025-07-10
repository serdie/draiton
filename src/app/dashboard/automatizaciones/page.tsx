import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AutomatizacionesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Automatizaciones</h1>
      <p className="text-muted-foreground">
        Conecta tus aplicaciones y automatiza tareas repetitivas.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Ahorra tiempo automatizando tus flujos de trabajo en esta sección.</p>
        </CardContent>
      </Card>
    </div>
  );
}
