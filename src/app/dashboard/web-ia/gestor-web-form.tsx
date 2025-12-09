
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Terminal, PenTool, BarChart, ShieldCheck, MessageCircle, Mail, MapPin } from 'lucide-react';
import type { AIPoweredWebManagementOutput } from '@/ai/flows/ai-powered-web-management';
import Image from 'next/image';

type FormState = {
  output: AIPoweredWebManagementOutput | null;
  error: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando Sitio...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generar Sitio</>}
    </Button>
  );
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  PenTool,
  BarChart,
  ShieldCheck,
  // Add other potential icons here
};

export function GestorWebForm({ action, setGeneratedSite }: { 
    action: (currentState: FormState, formData: FormData) => Promise<FormState>,
    setGeneratedSite: (site: AIPoweredWebManagementOutput | null) => void 
}) {
  const [state, setState] = useState<FormState>({ output: null, error: null });
  const [isPending, startTransition] = useTransition();

  const formAction = async (formData: FormData) => {
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
    });
  };

  useEffect(() => {
    if(state.output) {
        setGeneratedSite(state.output);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.output]);

  return (
    <>
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="businessDescription">Descripción del Negocio (*)</Label>
          <Textarea id="businessDescription" name="businessDescription" placeholder="Describe tu negocio, productos, servicios y público objetivo." required rows={5} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteType">Tipo de Sitio Web (*)</Label>
          <Select name="websiteType" required>
            <SelectTrigger id="websiteType">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Página Web</SelectItem>
              <SelectItem value="online store">Tienda Online</SelectItem>
              <SelectItem value="landing page">Landing Page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="designPreferences">Preferencias de Diseño</Label>
          <Textarea id="designPreferences" name="designPreferences" placeholder="Colores, estilo (moderno, minimalista), etc." rows={5}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="additionalFeatures">Funcionalidades Adicionales</Label>
          <Textarea id="additionalFeatures" name="additionalFeatures" placeholder="Blog, formulario de contacto, e-commerce, etc." rows={5}/>
        </div>
         <div className="space-y-2 md:col-span-2">
          <Label htmlFor="exampleWebsites">Sitios Web de Ejemplo (Opcional)</Label>
          <Input id="exampleWebsites" name="exampleWebsites" placeholder="https://ejemplo1.com, https://ejemplo2.com" />
        </div>
      </div>
      
      <SubmitButton />

      {state.error && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
    </form>
    
    {state.output && (
      <div className="mt-8 border-t pt-8 space-y-12">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Vista Previa de tu Nuevo Sitio Web</h2>
            <p className="text-muted-foreground mt-2">"{state.output.siteTitle}"</p>
        </div>
        
        {/* Hero Section */}
        <section className="relative h-96 rounded-lg overflow-hidden flex items-center justify-center text-center text-white bg-secondary">
            <Image 
                src={`https://picsum.photos/1200/800?random=${Math.random()}`}
                alt={state.output.hero.imagePrompt}
                data-ai-hint={state.output.hero.imagePrompt}
                fill
                className="object-cover z-0"
            />
            <div className="absolute inset-0 bg-black/50 z-10"/>
            <div className="z-20 p-4">
                <h1 className="text-4xl md:text-5xl font-bold">{state.output.hero.title}</h1>
                <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">{state.output.hero.subtitle}</p>
                <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90">{state.output.hero.ctaButtonText}</Button>
            </div>
        </section>

        {/* About Section */}
         <section className="container mx-auto py-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl font-bold mb-4">{state.output.about.title}</h2>
                    <p className="text-muted-foreground mb-4">{state.output.about.paragraph1}</p>
                    <p className="text-muted-foreground">{state.output.about.paragraph2}</p>
                </div>
                <div className="h-80 w-full relative rounded-lg overflow-hidden">
                    <Image 
                         src={`https://picsum.photos/600/400?random=${Math.random()}`}
                         alt={state.output.about.imagePrompt}
                         data-ai-hint={state.output.about.imagePrompt}
                         fill
                         className="object-cover"
                    />
                </div>
            </div>
        </section>

         {/* Services Section */}
        <section className="bg-muted py-16">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-10">Nuestros Servicios</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {state.output.services.map((service, index) => {
                        const Icon = iconMap[service.icon] || PenTool;
                        return (
                            <Card key={index}>
                                <CardHeader className="items-center text-center">
                                    <div className="p-3 bg-primary/10 rounded-full mb-4">
                                        <Icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <CardTitle>{service.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center text-muted-foreground">
                                    {service.description}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>

         {/* Testimonials Section */}
         <section className="container mx-auto py-16">
             <h2 className="text-3xl font-bold text-center mb-10">Lo que dicen nuestros clientes</h2>
             <div className="grid md:grid-cols-2 gap-8">
                 {state.output.testimonials.map((testimonial, index) => (
                     <Card key={index} className="bg-secondary border-none">
                         <CardContent className="p-6">
                            <MessageCircle className="h-8 w-8 text-primary mb-4"/>
                             <p className="italic text-lg mb-4">"{testimonial.quote}"</p>
                             <p className="font-semibold">{testimonial.author}</p>
                             <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                         </CardContent>
                     </Card>
                 ))}
             </div>
        </section>
        
        {/* Contact Section */}
        <section className="bg-muted py-16">
            <div className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-12">
                     <div>
                        <h2 className="text-3xl font-bold">{state.output.contact.title}</h2>
                        <p className="text-muted-foreground mt-2 mb-6">{state.output.contact.description}</p>
                        <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary"/>
                                <span className="text-muted-foreground">contacto@tuempresa.com</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-primary"/>
                                <span className="text-muted-foreground">Tu Dirección, 12345, Tu Ciudad</span>
                            </div>
                        </div>
                    </div>
                     <Card>
                        <CardContent className="p-6">
                            <form className="space-y-4">
                                {state.output.contact.formFields.map(field => (
                                    <div key={field}>
                                        <Label htmlFor={field.toLowerCase()}>{field}</Label>
                                        <Input id={field.toLowerCase()} placeholder={`${field}...`} />
                                    </div>
                                ))}
                                <Button className="w-full">{state.output.contact.buttonText}</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
      </div>
    )}
    </>
  );
}
