import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Users, Sparkles, MonitorCog, Blocks, Zap } from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Finanzas Inteligentes',
    description: 'Gestiona facturas, gastos y presupuestos. Digitaliza tickets con una foto y obtén previsiones de impuestos al instante.',
  },
  {
    icon: <Blocks className="h-8 w-8 text-primary" />,
    title: 'Operaciones Centralizadas',
    description: 'Controla tus proyectos, tareas y clientes desde un único lugar. Colabora con tu equipo y mantén todo organizado.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Marketing y Clientes (CRM)',
    description: 'Crea campañas de email con IA, gestiona tus contactos y encuentra nuevos clientes potenciales para tu negocio.',
  },
  {
    icon: <MonitorCog className="h-8 w-8 text-primary" />,
    title: 'Presencia Web con IA',
    description: 'Genera y gestiona tu página web o tienda online. La IA te ayuda a crear un sitio profesional sin saber programar.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Automatización Total',
    description: 'Conecta tus apps favoritas (Google, redes sociales, etc.) y crea flujos de trabajo que ahorran tiempo y eliminan tareas repetitivas.',
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'Asistente IA Proactivo',
    description: 'Tu socio estratégico que te ofrece ideas para crecer, busca subvenciones y te ayuda a redactar cualquier documento.',
  },
];

export function Features() {
  return (
    <section id="features" className="container py-20 md:py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">La navaja suiza para tu negocio</h2>
        <p className="mt-4 text-muted-foreground">
          Emprende Total integra todas las herramientas que necesitas para optimizar cada área de tu empresa.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <Card key={i} className="transform-gpu transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-lg">
            <CardHeader>
              <div className="mb-4">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription className="pt-2">{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
