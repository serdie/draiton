
'use client';

import { FileText, Blocks, Users, Sparkles, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const featureSections = [
  {
    category: 'Finanzas Inteligentes',
    icon: <FileText className="h-8 w-8" />,
    features: [
      {
        title: 'Facturación Completa y Veri*factu',
        description: 'Crea facturas, presupuestos y notas de crédito con aspecto profesional. Cumple con la normativa Veri*factu para garantizar la integridad de tus registros fiscales ante la Agencia Tributaria.',
        image: 'https://picsum.photos/seed/finance1/800/600',
        imageLeft: true,
        aiHint: 'invoice chart'
      },
      {
        title: 'Gestión de Gastos con IA',
        description: 'Digitaliza tus tickets y facturas de gastos con una simple foto. Nuestra IA extrae los datos automáticamente, ahorrándote tiempo y manteniendo tu contabilidad al día sin esfuerzo.',
        image: 'https://picsum.photos/seed/finance2/800/600',
        imageLeft: false,
        aiHint: 'ai data analysis'
      },
      {
        title: 'Previsión de Impuestos en Tiempo Real',
        description: 'Olvídate de las sorpresas trimestrales. Nuestra plataforma calcula una estimación de tus impuestos (IVA e IRPF) en tiempo real, dándote una visión clara de tu situación fiscal en todo momento.',
        image: 'https://picsum.photos/seed/finance3/800/600',
        imageLeft: true,
        aiHint: 'mountain landscape'
      },
    ],
  },
  {
    category: 'Operaciones y Productividad',
    icon: <Blocks className="h-8 w-8" />,
    features: [
      {
        title: 'Gestión de Proyectos y Tareas',
        description: 'Organiza tu trabajo con tableros Kanban intuitivos. Asigna tareas, establece fechas de entrega, registra el tiempo dedicado y sigue el progreso de tus proyectos de un solo vistazo.',
        image: 'https://picsum.photos/seed/ops1/800/600',
        imageLeft: true,
        aiHint: 'kanban board'
      },
      {
        title: 'CRM: Clientes y Proveedores',
        description: 'Centraliza toda la información de tus contactos. Gestiona clientes, leads y proveedores de forma eficiente para fortalecer tus relaciones comerciales y no perder ninguna oportunidad.',
        image: 'https://picsum.photos/seed/ops2/800/600',
        imageLeft: false,
        aiHint: 'silhouette feet'
      },
    ],
  },
    {
    category: 'Gestión de Equipos (Plan Empresa)',
    icon: <Users className="h-8 w-8" />,
    features: [
      {
        title: 'Control Horario y Fichajes',
        description: 'Cumple con la normativa laboral fácilmente. Tu equipo podrá registrar su jornada, pausas y solicitar modificaciones desde su portal, todo centralizado para tu gestión.',
        image: 'https://picsum.photos/seed/hr1/800/600',
        imageLeft: true,
        aiHint: 'leaning tower pisa'
      },
      {
        title: 'Gestión de Ausencias y Vacaciones',
        description: 'Administra las solicitudes de vacaciones y otras ausencias de tu equipo a través de un calendario visual e intuitivo. Aprueba o rechaza solicitudes con un solo clic.',
        image: 'https://picsum.photos/seed/hr2/800/600',
        imageLeft: false,
        aiHint: 'rusty barrel'
      },
       {
        title: 'Portal del Empleado y Nóminas',
        description: 'Ofrece a cada empleado un portal privado para consultar sus datos, fichajes y descargar sus nóminas, mejorando la transparencia y la comunicación interna.',
        image: 'https://picsum.photos/seed/hr3/800/600',
        imageLeft: true,
        aiHint: 'yellow windows'
      },
    ],
  },
  {
    category: 'Inteligencia Artificial para Crecer',
    icon: <Sparkles className="h-8 w-8" />,
    features: [
      {
        title: 'Asistente de Marketing y Redes Sociales',
        description: '¿Sin ideas para tu próxima campaña? La IA genera textos persuasivos para tus emails y publicaciones en redes sociales, adaptados a tu tono y objetivos.',
        image: 'https://picsum.photos/seed/ai1/800/600',
        imageLeft: true,
        aiHint: 'ai robot interface'
      },
      {
        title: 'Gestor y Analizador Web IA',
        description: 'Crea una página web profesional sin escribir código o analiza tu sitio actual. La IA te proporcionará un informe detallado con mejoras clave en SEO, rendimiento y diseño.',
        image: 'https://picsum.photos/seed/ai2/800/600',
        imageLeft: false,
        aiHint: 'woman smiling computer'
      },
      {
        title: 'Buscador de Oportunidades',
        description: 'Nuestra IA investiga por ti para encontrar ayudas, subvenciones públicas relevantes para tu sector y te sugiere clientes potenciales que encajan con el perfil de tu negocio.',
        image: 'https://picsum.photos/seed/ai3/800/600',
        imageLeft: true,
        aiHint: 'cityscape sunset'
      },
    ],
  },
];

export function FeaturesDetailed() {
  return (
    <div className="bg-background text-foreground">
      <section className="py-20 md:py-28 text-center container">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Todo lo que necesitas, en un solo lugar.</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Desde finanzas y marketing hasta la gestión de equipos y proyectos, Draiton centraliza las herramientas esenciales para el autónomo y la pyme moderna.
        </p>
      </section>

      {featureSections.map((section, index) => (
        <section key={index} className="py-16 md:py-24 border-t">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block p-4 bg-primary/10 text-primary rounded-xl mb-4">
                {section.icon}
              </div>
              <h2 className="text-3xl font-bold">{section.category}</h2>
            </div>
            <div className="space-y-20">
              {section.features.map((feature, featureIndex) => (
                <div key={featureIndex} className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${feature.imageLeft ? '' : 'md:grid-flow-row-dense'}`}>
                  <div className={`relative aspect-video rounded-lg overflow-hidden shadow-lg ${feature.imageLeft ? '' : 'md:col-start-2'}`}>
                     <Image src={feature.image} alt={feature.title} fill className="object-cover" data-ai-hint={feature.aiHint}/>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground text-lg">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

        <section className="py-20 md:py-28 text-center container">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">¿Listo para transformar tu negocio?</h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
            Únete a cientos de profesionales que ya gestionan su negocio de forma más inteligente.
            </p>
            <div className="mt-8">
                <Button size="lg" asChild>
                    <Link href="/register">
                        Empieza Gratis <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>

    </div>
  );
}
