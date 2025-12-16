'use client';

import { Sparkles, Mail, Rss, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthVideo } from '@/components/auth-video';

const features = [
    {
        icon: <Sparkles className="h-8 w-8 text-primary" />,
        title: "Generación de Contenido con IA",
        description: "¿Atascado sin ideas? Simplemente describe tu objetivo y la IA creará textos persuasivos para tus correos y publicaciones, optimizados para cada plataforma.",
        image: "https://picsum.photos/seed/forestcloud/800/600",
        imageLeft: true,
        aiHint: "forest clouds"
    },
    {
        icon: <Mail className="h-8 w-8 text-primary" />,
        title: "Campañas de Email Automatizadas",
        description: "Crea, programa y envía campañas de email marketing directamente desde Draiton. Analiza las tasas de apertura y clics para optimizar tus resultados.",
        image: "https://picsum.photos/seed/skatepark/800/600",
        imageLeft: false,
        aiHint: "skatepark"
    },
    {
        icon: <Rss className="h-8 w-8 text-primary" />,
        title: "Gestión de Redes Sociales Centralizada",
        description: "Conecta tus perfiles de Facebook, Instagram y LinkedIn. Programa tus publicaciones con antelación y mantén una presencia activa sin salir de la aplicación.",
        image: "https://picsum.photos/seed/snowmountain/800/600",
        imageLeft: true,
        aiHint: "snowy mountain"
    }
];

export function MarketingFeatures() {
  return (
    <div className="bg-background text-foreground">
        <section className="relative w-full h-[60vh] overflow-hidden flex items-center justify-center text-center">
            <AuthVideo />
            <div className="absolute inset-0 bg-black/60 z-10"/>
            <div className="z-20 p-4 text-white max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl/tight">
                    Tu Estratega de Marketing Digital, Potenciado por IA
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">
                    Crea contenido atractivo, automatiza tus campañas de correo y gestiona tus redes sociales desde un único lugar. Draiton es tu copiloto para el crecimiento.
                </p>
            </div>
        </section>

        <section className="py-20 md:py-28">
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
        </section>

        <section className="py-20 md:py-28 text-center container border-t">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Convierte Ideas en Resultados</h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
                Deja que la IA se encargue del trabajo pesado y enfócate en la estrategia. Empieza a crear campañas más efectivas hoy mismo.
            </p>
            <div className="mt-8">
                <Button size="lg" asChild>
                    <Link href="/seleccionar-plan">
                        Ver Planes <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>
    </div>
  );
}