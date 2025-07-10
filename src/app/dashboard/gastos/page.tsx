import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GastosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gastos</h1>
      <p className="text-muted-foreground">
        Lleva un control detallado de todos tus gastos.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Registra y categoriza tus gastos para una mejor gestión financiera.</p>
        </CardContent>
      </Card>
    </div>
  );
}
