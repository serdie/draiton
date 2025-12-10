
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, User, Briefcase, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const pricing = {
    mensual: {
        pro: 9.95,
        empresa: 58,
    },
    anual: {
        pro: 4.95,
        empresa: 29,
    }
};

const plans = (billingCycle: 'anual' | 'mensual') => [
    {
        name: 'Gratis',
        description: 'Ideal para empezar y probar la plataforma.',
        price: '0€',
        priceSuffix: '/mes',
        icon: <User className="h-8 w-8 text-primary" />,
        features: [
            'Panel de control',
            'Gestión básica de documentos y gastos',
            'CRM limitado',
            '1 Proyecto'
        ],
        plan: 'free',
        buttonText: 'Empezar con el Plan Gratis',
        buttonLink: '/register?plan=free'
    },
    {
        name: 'Autónomo (Pro)',
        description: 'Perfecto para profesionales que quieren crecer.',
        price: `${pricing[billingCycle].pro.toLocaleString('es-ES')}€`,
        priceSuffix: '/mes',
        icon: <Briefcase className="h-8 w-8 text-primary" />,
        features: [
            'Todo lo del plan Gratis',
            'Documentos, gastos y proyectos ilimitados',
            'Herramientas IA de Marketing y Web',
            'Automatizaciones'
        ],
        plan: 'pro',
        buttonText: 'Elegir Plan Pro',
        buttonLink: `/register?plan=pro&billing=${billingCycle}`
    },
    {
        name: 'Empresa',
        description: 'Para negocios que necesitan herramientas de colaboración.',
        price: `${pricing[billingCycle].empresa.toLocaleString('es-ES')}€`,
        priceSuffix: '/mes',
        icon: <Building className="h-8 w-8 text-primary" />,
        features: [
            'Todo lo del plan Pro',
            'Gestión de Empleados',
            'Generación de Nóminas',
            'Control Horario (Fichajes)'
        ],
        plan: 'empresa',
        buttonText: 'Elegir Plan Empresa',
        buttonLink: `/register?plan=empresa&billing=${billingCycle}`
    },
    {
        name: 'Gestorías',
        description: 'Una solución a medida para gestorías y asesorías.',
        price: 'Personalizado',
        priceSuffix: '',
        icon: <Briefcase className="h-8 w-8 text-primary" />,
        features: [
            'Todo lo del plan Empresa',
            'Gestión multi-cliente',
            'Panel de control para gestor',
            'Marca blanca y soporte dedicado'
        ],
        plan: 'gestoria',
        buttonText: 'Contactar',
        buttonLink: 'mailto:info@draiton.es?subject=Plan%20Gestor%C3%ADa'
    }
];

export default function SeleccionarPlanPage() {
  const [billingCycle, setBillingCycle] = useState<'anual' | 'mensual'>('anual');

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
        
        <div className="flex justify-center items-center gap-4 mb-10">
            <Label htmlFor="billing-cycle" className={billingCycle === 'mensual' ? 'text-primary font-semibold' : 'text-muted-foreground'}>
              Pago Mensual
            </Label>
            <Switch
              id="billing-cycle"
              checked={billingCycle === 'anual'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'anual' : 'mensual')}
            />
            <Label htmlFor="billing-cycle" className={billingCycle === 'anual' ? 'text-primary font-semibold' : 'text-muted-foreground'}>
              Pago Anual
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Oferta de lanzamiento 50% descuento</Badge>
            </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans(billingCycle).map((plan) => (
            <Card key={plan.name} className="flex flex-col">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  {plan.icon}
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="text-3xl font-bold text-center">{plan.price}<span className="text-xl font-normal text-muted-foreground">{plan.priceSuffix}</span></div>
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
                  <Link href={plan.buttonLink}>
                    {plan.buttonText}
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
