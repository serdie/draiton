
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const freeFeatures = [
  'Panel de control principal',
  'Gestión de Documentos (5/mes)',
  'Gestión de Gastos (5/mes)',
  'Gestión de Contactos (10)',
  'Gestión de Proyectos (1)',
  'Asistente IA (Consultas básicas)',
];

const proFeatures = [
  'Todo lo del plan Gratis',
  'Documentos, Gastos y Contactos Ilimitados',
  'Gestión de facturas con Verifactu',
  'Proyectos Ilimitados',
  'Marketing IA (Emails, Posts Redes Sociales)',
  'Web IA (Creación y análisis de sitios web)',
  'Automatizaciones y Conexiones con apps',
  'Buscador IA de ayudas y clientes',
  'Importación IA (Facturas y Gastos)',
];

const enterpriseFeatures = [
    'Todo lo del plan Pro',
    'Gestión de Empleados (hasta 5)',
    'Gestión y generación de Nóminas',
    'Control Horario (Fichajes)',
    'Analíticas Avanzadas e Informes',
    'Soporte prioritario 24/7',
];

export function Pricing() {
  return (
    <section id="pricing" className="container py-20 md:py-24 mx-auto">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Un plan para cada etapa de tu negocio</h2>
        <p className="mt-4 text-muted-foreground">
          Comienza gratis y escala cuando lo necesites. Sin compromisos, cancela cuando quieras.
        </p>
      </div>
      <div className="grid max-w-7xl mx-auto gap-8 md:grid-cols-1 lg:grid-cols-3">
        {/* Plan Gratis */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Gratis</CardTitle>
            <CardDescription>Para empezar a organizar tu negocio y probar la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            <div className="text-4xl font-bold">0€<span className="text-xl font-normal text-muted-foreground">/mes</span></div>
            <ul className="space-y-2">
              {freeFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">Comienza Gratis</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Plan Pro */}
        <Card className="border-accent shadow-lg flex flex-col relative">
          <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Más Popular</Badge>
          <CardHeader>
            <CardTitle>Pro (Autónomo)</CardTitle>
            <CardDescription>Para profesionales que quieren llevar su negocio al siguiente nivel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            <div className="text-4xl font-bold">4.95€<span className="text-xl font-normal text-muted-foreground">/mes</span></div>
            <ul className="space-y-2">
              {proFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
              <Link href="/dashboard">Elegir Plan Pro</Link>
            </Button>
          </CardFooter>
        </Card>

         {/* Plan Empresa */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Empresa</CardTitle>
            <CardDescription>Para negocios en crecimiento que necesitan más potencia y colaboración.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            <div className="text-4xl font-bold">29€<span className="text-xl font-normal text-muted-foreground">/mes</span></div>
            <ul className="space-y-2">
              {enterpriseFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">Elegir Plan Empresa</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
