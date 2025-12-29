
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Mock data representing the current landing page content.
// In a real app, this would come from a database.
const initialContent = {
  hero: {
    title: 'La plataforma todo en uno para tu negocio',
    subtitle: 'Desde facturación y marketing hasta gestión de redes sociales y clientes. Emprende Total centraliza todas tus herramientas para que puedas enfocarte en crecer.',
  },
  features: [
    { title: 'Gestión Financiera', description: 'Crea facturas, presupuestos y lleva tu contabilidad de forma sencilla e integrada.' },
    { title: 'Marketing Automatizado', description: 'Automatiza tus campañas de email, newsletters y extrae contactos para tus envíos.' },
    { title: 'Gestión de Redes Sociales', description: 'Administra todos tus perfiles sociales desde un único lugar sin salir de la app.' },
    { title: 'Clientes y Proveedores', description: 'Gestiona tus contactos de forma avanzada y optimiza tus relaciones comerciales.' },
    { title: 'Automatizaciones', description: 'Conecta tus aplicaciones externas y automatiza flujos de trabajo en todas las áreas.' },
    { title: 'Asistente IA de Negocio', description: 'Recibe ideas para mejorar tu comercialización y productos gracias a nuestra IA.' },
    { title: 'Gestor Web con IA', description: 'Crea y gestiona tu página web, tienda online o landing page con el poder de la IA.' },
    { title: 'Importación Inteligente', description: 'Importa facturas desde PDF, Excel o simplemente con una foto.' },
  ],
};

export function ContentTab() {
  const { toast } = useToast();

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // In a real app, you'd send this data to a server action to update the database.
    console.log('Contenido a guardar:', data);

    toast({
      title: 'Contenido Guardado (Simulación)',
      description: 'El contenido de la página de inicio se ha actualizado. Los cambios se reflejarán en breve.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Contenido de la Landing Page</CardTitle>
        <CardDescription>
          Modifica los textos principales de la página de inicio directamente desde aquí.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-8">
          {/* Hero Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-lg font-medium">Sección Principal (Hero)</h3>
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Título Principal</Label>
              <Input id="heroTitle" name="heroTitle" defaultValue={initialContent.hero.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Subtítulo</Label>
              <Textarea id="heroSubtitle" name="heroSubtitle" defaultValue={initialContent.hero.subtitle} rows={3} />
            </div>
          </div>

          {/* Features Section */}
          <div className="space-y-4 p-4 border rounded-lg">
             <h3 className="text-lg font-medium">Sección de Características</h3>
              <Accordion type="single" collapsible className="w-full">
                {initialContent.features.map((feature, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger>{feature.title}</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor={`featureTitle${index}`}>Título de la Característica</Label>
                                <Input id={`featureTitle${index}`} name={`featureTitle${index}`} defaultValue={feature.title} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`featureDescription${index}`}>Descripción</Label>
                                <Textarea id={`featureDescription${index}`} name={`featureDescription${index}`} defaultValue={feature.description} rows={2} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          </div>

          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Guardar Contenido
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
