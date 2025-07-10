import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Marketing</h1>
      <p className="text-muted-foreground">
        Automatiza tus campañas de email, newsletters y gestiona tus envíos masivos.
      </p>
       <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
          <CardDescription>Esta sección está en desarrollo.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Pronto podrás lanzar tus campañas de marketing directamente desde aquí.</p>
        </CardContent>
      </Card>
    </div>
  );
}
