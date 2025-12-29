import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClientesProveedoresPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clientes y Proveedores</h1>
      <p className="text-muted-foreground">
        Administra tus contactos y relaciones comerciales de forma eficiente.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Tu CRM integrado estará disponible aquí muy pronto.</p>
        </CardContent>
      </Card>
    </div>
  );
}
