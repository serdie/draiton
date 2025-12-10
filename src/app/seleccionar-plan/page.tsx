
import Link from 'next/link';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, User, Briefcase, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
    {
        name: 'Gratis',
        description: 'Ideal para empezar y probar la plataforma.',
        price: '0€',
        icon: <User className="h-8 w-8 text-primary" />,
        features: [
            'Panel de control',
            'Gestión básica de documentos y gastos',
            'CRM limitado',
            '1 Proyecto'
        ],
        plan: 'free',
    },
    {
        name: 'Autónomo (Pro)',
        description: 'Perfecto para profesionales que quieren crecer.',
        price: '4.95€/mes',
        icon: <Briefcase className="h-8 w-8 text-primary" />,
        features: [
            'Todo lo del plan Gratis',
            'Documentos, gastos y proyectos ilimitados',
            'Herramientas IA de Marketing y Web',
            'Automatizaciones'
        ],
        plan: 'pro',
    },
    {
        name: 'Empresa',
        description: 'Para negocios que necesitan herramientas de colaboración.',
        price: '29€/mes',
        icon: <Building className="h-8 w-8 text-primary" />,
        features: [
            'Todo lo del plan Pro',
            'Gestión de Empleados',
            'Generación de Nóminas',
            'Control Horario (Fichajes)'
        ],
        plan: 'empresa',
    }
];

export default function SeleccionarPlanPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container py-12 md:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Elige tu Plan para Empezar</h1>
            <p className="mt-4 text-muted-foreground">
            Selecciona el plan que mejor se adapte a tus necesidades. Puedes cambiarlo más adelante.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className="flex flex-col">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  {plan.icon}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="text-3xl font-bold text-center">{plan.price}</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href={`/register?plan=${plan.plan}`}>
                    Empezar con el Plan {plan.name}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
