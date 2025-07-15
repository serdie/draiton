
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TareasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestor de Tareas</h1>
      <p className="text-muted-foreground">
        Organiza tu día a día y no te olvides de nada importante.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Un gestor de tareas simple y potente, integrado con tus proyectos.</p>
        </CardContent>
      </Card>
    </div>
  );
}
