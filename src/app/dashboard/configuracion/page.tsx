import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuración</h1>
      <p className="text-muted-foreground">
        Gestiona la configuración de tu cuenta y de la aplicación.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Personaliza tu experiencia y ajusta las preferencias de la aplicación.</p>
        </CardContent>
      </Card>
    </div>
  );
}
