import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RedesSocialesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Redes Sociales</h1>
      <p className="text-muted-foreground">
        Gestiona todas tus redes sociales sin salir de la aplicación.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Conecta tus cuentas y gestiona tu presencia online de forma centralizada.</p>
        </CardContent>
      </Card>
    </div>
  );
}
