
'use client';

import { PenTool, Search, CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthVideo } from '@/components/auth-video';

const features = [
    {
        icon: <PenTool className="h-8 w-8 text-primary" />,
        title: "Crea tu Web con una Descripción",
        description: "¿No tienes web? Simplemente describe tu negocio, elige un estilo y la IA generará una página web completa, una tienda online o una landing page lista para usar.",
        image: "https://picsum.photos/seed/mountaintop/800/600",
        imageLeft: true,
        aiHint: "mountain top"
    },
    {
        icon: <Search className="h-8 w-8 text-primary" />,
        title: "Analizador SEO y de Rendimiento",
        description: "¿Ya tienes una web? Introduce la URL y la IA realizará un análisis exhaustivo, dándote un informe detallado con puntos de mejora accionables en SEO, velocidad y diseño.",
        image: "https://picsum.photos/seed/mistybridge/800/600",
        imageLeft: false,
        aiHint: "misty bridge"
    },
    {
        icon: <CheckCircle className="h-8 w-8 text-primary" />,
        title: "Optimización Continua",
        description: "Recibe sugerencias para mejorar tu contenido, optimizar tus imágenes y asegurarte de que tu sitio cumple con los estándares de seguridad y accesibilidad más recientes.",
        image: "https://picsum.photos/seed/brooklynbridge/800/600",
        imageLeft: true,
        aiHint: "brooklyn bridge"
    }
];

export function WebManagerFeatures() {
  return (
    <div className="bg-background text-foreground">
        <section className="relative w-full h-[60vh] overflow-hidden flex items-center justify-center text-center">
            <AuthVideo />
            <div className="absolute inset-0 bg-black/60 z-10"/>
            <div className="z-20 p-4 text-white max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl/tight">
                    Tu Presencia Online, Impulsada por Inteligencia Artificial
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">
                    Crea una web profesional sin escribir una línea de código o analiza y mejora tu sitio existente para atraer más clientes.
                </p>
            </div>
        </section>

        <section className="py-20 md:py-28">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto space-y-20">
                    {features.map((feature, index) => (
                        <div key={index} className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${feature.imageLeft ? '' : 'md:grid-flow-row-dense'}`}>
                            <div className={`relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg ${feature.imageLeft ? '' : 'md:col-start-2'}`}>
                                <Image src={feature.image} alt={feature.title} fill className="object-cover" data-ai-hint={feature.aiHint} />
                            </div>
                            <div className="space-y-4">
                                <div className="inline-block p-4 bg-primary/10 text-primary rounded-xl mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold">{feature.title}</h3>
                                <p className="text-muted-foreground text-lg">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section className="py-20 md:py-28 text-center border-t">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Lleva tu Web al Siguiente Nivel</h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
                        Desbloquea las herramientas IA para crear una presencia online que convierta visitantes en clientes.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" asChild>
                            <Link href="/seleccionar-plan">
                                Ver Planes <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    </div>
  );
}
