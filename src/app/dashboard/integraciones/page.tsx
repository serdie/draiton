import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function IntegracionesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Integraciones</h1>
      <p className="text-muted-foreground">
        Integra tus correos, redes sociales, Google Drive y más.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conecta todas tus herramientas para tener tu mundo en un solo lugar.</p>
        </CardContent>
      </Card>
    </div>
  );
}
