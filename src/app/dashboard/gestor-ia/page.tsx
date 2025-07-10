import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GestorIAPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestor IA</h1>
      <p className="text-muted-foreground">
        Utiliza nuestro gestor de IA para optimizar tus operaciones.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Interactúa con nuestro asistente de IA para resolver dudas y mejorar tu negocio.</p>
        </CardContent>
      </Card>
    </div>
  );
}
