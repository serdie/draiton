
'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Terminal, PenTool, BarChart, ShieldCheck, MessageCircle, Mail, MapPin, Save, Download, Pencil } from 'lucide-react';
import type { AIPoweredWebManagementOutput } from '@/ai/flows/ai-powered-web-management';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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
};

export function GestorWebForm({ action, setGeneratedSite }: { 
    action: (currentState: FormState, formData: FormData) => Promise<FormState>,
    setGeneratedSite: (site: AIPoweredWebManagementOutput | null) => void 
}) {
  const [state, setState] = useState<FormState>({ output: null, error: null });
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState<AIPoweredWebManagementOutput | null>(null);
  const { toast } = useToast();

  const formAction = async (formData: FormData) => {
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
      if (result.output) {
          setEditableContent(result.output);
      }
    });
  };

  useEffect(() => {
    if(state.output) {
        setGeneratedSite(state.output);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.output]);

  const handleContentChange = (section: string, value: string, index?: number, field?: string) => {
    if (!editableContent) return;

    let newContent = { ...editableContent };

    if (section === 'hero' && field) {
        (newContent.hero as any)[field] = value;
    } else if (section === 'about' && field) {
        (newContent.about as any)[field] = value;
    } else if (section === 'services' && typeof index === 'number' && field) {
        (newContent.services[index] as any)[field] = value;
    }

    setEditableContent(newContent);
  };
  
  const handleDownload = async () => {
    if (!editableContent) return;
    
    toast({ title: 'Preparando descarga...', description: 'Generando archivos HTML, CSS y JS.' });

    const zip = new JSZip();

    // HTML Structure
    const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${editableContent.siteTitle}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="hero">
        <div class="hero-content">
            <h1>${editableContent.hero.title}</h1>
            <p>${editableContent.hero.subtitle}</p>
            <button>${editableContent.hero.ctaButtonText}</button>
        </div>
    </header>

    <main>
        <section class="about">
            <h2>${editableContent.about.title}</h2>
            <div class="about-content">
                <div class="text">
                    <p>${editableContent.about.paragraph1}</p>
                    <p>${editableContent.about.paragraph2}</p>
                </div>
                <img src="https://picsum.photos/600/400?random=2" alt="${editableContent.about.imagePrompt}">
            </div>
        </section>

        <section class="services">
            <h2>Nuestros Servicios</h2>
            <div class="services-grid">
                ${editableContent.services.map(service => `
                    <div class="service-card">
                        <h3>${service.title}</h3>
                        <p>${service.description}</p>
                    </div>
                `).join('')}
            </div>
        </section>

         <section class="testimonials">
            <h2>Lo que dicen nuestros clientes</h2>
            <div class="testimonials-grid">
                ${editableContent.testimonials.map(t => `
                    <div class="testimonial-card">
                        <p>"${t.quote}"</p>
                        <cite>- ${t.author}, ${t.company}</cite>
                    </div>
                `).join('')}
            </div>
        </section>

        <section class="contact">
             <h2>${editableContent.contact.title}</h2>
             <p>${editableContent.contact.description}</p>
             <form>
                ${editableContent.contact.formFields.map(f => `
                    <label for="${f.toLowerCase()}">${f}</label>
                    <input type="text" id="${f.toLowerCase()}" name="${f.toLowerCase()}">
                `).join('')}
                <button type="submit">${editableContent.contact.buttonText}</button>
             </form>
        </section>
    </main>
    <script src="script.js"></script>
</body>
</html>`;

    // CSS Structure (simplified)
    const cssContent = `
body { font-family: sans-serif; margin: 0; color: #333; }
.hero { height: 80vh; background: url('https://picsum.photos/1200/800?random=1') no-repeat center center/cover; color: white; display: flex; align-items: center; justify-content: center; text-align: center; }
.hero-content { background: rgba(0,0,0,0.5); padding: 2rem; border-radius: 8px; }
section { padding: 4rem 2rem; }
.about-content { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: center; }
.services-grid, .testimonials-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.service-card, .testimonial-card, .contact form { border: 1px solid #eee; padding: 1.5rem; border-radius: 8px; }
button { background: #007bff; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 5px; cursor: pointer; }
input { width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #ccc; border-radius: 4px; }
`;

    const jsContent = `console.log("Sitio web '${editableContent.siteTitle}' cargado.");`;

    zip.file("index.html", htmlContent);
    zip.file("style.css", cssContent);
    zip.file("script.js", jsContent);

    zip.generateAsync({ type: "blob" }).then(function(content) {
        saveAs(content, `${editableContent.siteTitle.replace(/\s+/g, '_')}.zip`);
    });
  }

  const handleSaveTemplate = () => {
    toast({ title: "Plantilla Guardada (Simulación)", description: "Tu diseño actual ha sido guardado en tus plantillas." });
    // In a real app, you would save `editableContent` to Firestore here.
  }

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
    
    {editableContent && (
      <div className="mt-8 border-t pt-8 space-y-8">
        <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Vista Previa de tu Nuevo Sitio Web</h2>
            <p className="text-muted-foreground mt-2">"{editableContent.siteTitle}"</p>
        </div>
         {/* Action Buttons */}
        <Card>
            <CardContent className="p-4 flex flex-wrap items-center justify-center gap-4">
                 <Button variant={isEditing ? 'default': 'outline'} onClick={() => setIsEditing(!isEditing)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {isEditing ? 'Finalizar Edición' : 'Editar'}
                </Button>
                {isEditing && (
                     <Button onClick={() => {setIsEditing(false); toast({title: "Cambios guardados en la vista previa"})}}>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                    </Button>
                )}
                <Button variant="outline" onClick={handleSaveTemplate}>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar como Plantilla
                </Button>
                <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar (ZIP)
                </Button>
            </CardContent>
        </Card>
        
        {/* Hero Section */}
        <section className="relative h-96 rounded-lg overflow-hidden flex items-center justify-center text-center text-white bg-secondary">
            <Image 
                src={`https://picsum.photos/1200/800?random=${Math.random()}`}
                alt={editableContent.hero.imagePrompt}
                data-ai-hint={editableContent.hero.imagePrompt}
                fill
                className="object-cover z-0"
            />
            <div className="absolute inset-0 bg-black/50 z-10"/>
            <div className="z-20 p-4">
                <Textarea 
                    value={editableContent.hero.title}
                    onChange={(e) => handleContentChange('hero', e.target.value, undefined, 'title')}
                    disabled={!isEditing}
                    className="text-4xl md:text-5xl font-bold bg-transparent border-none text-center text-white w-full"
                />
                 <Textarea
                    value={editableContent.hero.subtitle}
                    onChange={(e) => handleContentChange('hero', e.target.value, undefined, 'subtitle')}
                    disabled={!isEditing}
                    className="mt-4 text-lg md:text-xl max-w-2xl mx-auto bg-transparent border-none text-center text-white/80 w-full"
                    rows={3}
                />
                <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90">{editableContent.hero.ctaButtonText}</Button>
            </div>
        </section>

        {/* About Section */}
         <section className="container mx-auto py-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                     <Textarea value={editableContent.about.title} onChange={e => handleContentChange('about', e.target.value, undefined, 'title')} disabled={!isEditing} className="text-3xl font-bold mb-4 bg-transparent border-none w-full" />
                    <Textarea value={editableContent.about.paragraph1} onChange={e => handleContentChange('about', e.target.value, undefined, 'paragraph1')} disabled={!isEditing} className="text-muted-foreground mb-4 bg-transparent border-none w-full" rows={4}/>
                    <Textarea value={editableContent.about.paragraph2} onChange={e => handleContentChange('about', e.target.value, undefined, 'paragraph2')} disabled={!isEditing} className="text-muted-foreground bg-transparent border-none w-full" rows={4}/>
                </div>
                <div className="h-80 w-full relative rounded-lg overflow-hidden">
                    <Image 
                         src={`https://picsum.photos/600/400?random=${Math.random()}`}
                         alt={editableContent.about.imagePrompt}
                         data-ai-hint={editableContent.about.imagePrompt}
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
                    {editableContent.services.map((service, index) => {
                        const Icon = iconMap[service.icon] || PenTool;
                        return (
                            <Card key={index}>
                                <CardHeader className="items-center text-center">
                                    <div className="p-3 bg-primary/10 rounded-full mb-4">
                                        <Icon className="h-8 w-8 text-primary" />
                                    </div>
                                     <Input value={service.title} onChange={e => handleContentChange('services', e.target.value, index, 'title')} disabled={!isEditing} className="text-lg font-bold text-center border-none bg-transparent" />
                                </CardHeader>
                                <CardContent className="text-center text-muted-foreground">
                                     <Textarea value={service.description} onChange={e => handleContentChange('services', e.target.value, index, 'description')} disabled={!isEditing} className="text-center border-none bg-transparent" />
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
      </div>
    )}
    </>
  );
}
