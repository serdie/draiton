import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';

const freeFeatures = [
  'Gestión de hasta 10 clientes',
  'Creación de 5 facturas/mes',
  'Asistente IA (Básico)',
];

const proFeatures = [
  'Todas las funciones del plan Gratis',
  'Clientes y facturas ilimitados',
  'Marketing y redes sociales',
  'Automatizaciones completas',
  'Gestor Web y Extractor de Facturas con IA',
  'Soporte prioritario',
];

export function Pricing() {
  return (
    <section id="pricing" className="container py-20 md:py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Un plan para cada etapa de tu negocio</h2>
        <p className="mt-4 text-muted-foreground">
          Comienza gratis y escala cuando lo necesites. Sin compromisos, cancela cuando quieras.
        </p>
      </div>
      <div className="grid max-w-4xl mx-auto gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gratis</CardTitle>
            <CardDescription>Para empezar a organizar tu negocio y probar la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
        <Card className="border-accent shadow-lg">
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>Para profesionales que quieren llevar su negocio al siguiente nivel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
      </div>
    </section>
  );
}
