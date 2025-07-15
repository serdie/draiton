
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VisionGeneralPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Visión General Financiera</h1>
      <p className="text-muted-foreground">
        Tu centro de mando para la salud económica de tu negocio.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aquí verás gráficos de ingresos vs. gastos, previsiones y mucho más.</p>
        </CardContent>
      </Card>
    </div>
  );
}
