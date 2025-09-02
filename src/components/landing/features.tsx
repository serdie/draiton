import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileText, Users, Sparkles, MonitorCog, Blocks, Zap } from 'lucide-react';
import Image from 'next/image';

const features = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Finanzas Inteligentes',
    description: 'Gestiona facturas, gastos y presupuestos. Digitaliza tickets con una foto y obtén previsiones de impuestos al instante.',
    image: 'https://www.diemy.es/wp-content/uploads/2025/09/Gemini_Generated_Image_dsu1hgdsu1hgdsu1.png',
    aiHint: 'finances chart'
  },
  {
    icon: <Blocks className="h-8 w-8 text-primary" />,
    title: 'Operaciones Centralizadas',
    description: 'Controla tus proyectos, tareas y clientes desde un único lugar. Colabora con tu equipo y mantén todo organizado.',
    image: 'https://www.diemy.es/wp-content/uploads/2025/09/Gemini_Generated_Image_kza7z9kza7z9kza7.png',
    aiHint: 'team collaboration'
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Marketing y Clientes (CRM)',
    description: 'Crea campañas de email con IA, gestiona tus contactos y encuentra nuevos clientes potenciales para tu negocio.',
    image: 'https://picsum.photos/seed/marketing/400/250',
    aiHint: 'marketing campaign'
  },
  {
    icon: <MonitorCog className="h-8 w-8 text-primary" />,
    title: 'Presencia Web con IA',
    description: 'Genera y gestiona tu página web o tienda online. La IA te ayuda a crear un sitio profesional sin saber programar.',
    image: 'https://picsum.photos/seed/web/400/250',
    aiHint: 'website design'
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Automatización Total',
    description: 'Conecta tus apps favoritas (Google, redes sociales, etc.) y crea flujos de trabajo que ahorran tiempo y eliminan tareas repetitivas.',
    image: 'https://picsum.photos/seed/automatizacion/400/250',
    aiHint: 'automation workflow'
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'Asistente IA Proactivo',
    description: 'Tu socio estratégico que te ofrece ideas para crecer, busca subvenciones y te ayuda a redactar cualquier documento.',
    image: 'https://picsum.photos/seed/asistente/400/250',
    aiHint: 'ai assistant'
  },
];

export function Features() {
  return (
    <section id="features" className="container py-20 md:py-24 mx-auto">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">La navaja suiza para tu negocio</h2>
        <p className="mt-4 text-muted-foreground">
          Emprende Total integra todas las herramientas que necesitas para optimizar cada área de tu empresa.
        </p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <Card key={i} className="transform-gpu transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl overflow-hidden flex flex-col">
            <div className="relative h-48 w-full">
                <Image src={feature.image} alt={feature.title} fill className="object-cover" data-ai-hint={feature.aiHint} />
            </div>
            <CardHeader>
              <div className="mb-4">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                 <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
