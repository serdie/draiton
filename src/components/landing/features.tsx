import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, Mail, Share2, Users, Wand2, Sparkles, MonitorCog, ScanLine } from 'lucide-react';

const features = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Gestión Financiera',
    description: 'Crea facturas, presupuestos y lleva tu contabilidad de forma sencilla e integrada.',
  },
  {
    icon: <Mail className="h-8 w-8 text-primary" />,
    title: 'Marketing Automatizado',
    description: 'Automatiza tus campañas de email, newsletters y extrae contactos para tus envíos.',
  },
  {
    icon: <Share2 className="h-8 w-8 text-primary" />,
    title: 'Gestión de Redes Sociales',
    description: 'Administra todos tus perfiles sociales desde un único lugar sin salir de la app.',
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: 'Clientes y Proveedores',
    description: 'Gestiona tus contactos de forma avanzada y optimiza tus relaciones comerciales.',
  },
  {
    icon: <Wand2 className="h-8 w-8 text-primary" />,
    title: 'Automatizaciones',
    description: 'Conecta tus aplicaciones externas y automatiza flujos de trabajo en todas las áreas.',
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'Asistente IA de Negocio',
    description: 'Recibe ideas para mejorar tu comercialización y productos gracias a nuestra IA.',
  },
  {
    icon: <MonitorCog className="h-8 w-8 text-primary" />,
    title: 'Gestor Web con IA',
    description: 'Crea y gestiona tu página web, tienda online o landing page con el poder de la IA.',
  },
  {
    icon: <ScanLine className="h-8 w-8 text-primary" />,
    title: 'Importación Inteligente',
    description: 'Importa facturas desde PDF, Excel o simplemente con una foto.',
  },
];

export function Features() {
  return (
    <section id="features" className="container py-20 md:py-24">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Todo lo que necesitas, en un solo lugar</h2>
        <p className="mt-4 text-muted-foreground">
          Emprende Total está diseñado para que los autónomos y pequeñas empresas puedan masificar su producción con el mínimo esfuerzo.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
