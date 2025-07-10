import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProyectosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Proyectos</h1>
      <p className="text-muted-foreground">
        Organiza y sigue el progreso de todos tus proyectos.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Gestiona tareas, plazos y colabora en tus proyectos desde un solo lugar.</p>
        </CardContent>
      </Card>
    </div>
  );
}
