import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FacturacionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Facturación</h1>
      <p className="text-muted-foreground">
        Gestiona tus facturas, presupuestos y facturas rectificativas.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aquí podrás crear y administrar toda tu facturación de manera eficiente.</p>
        </CardContent>
      </Card>
    </div>
  );
}
