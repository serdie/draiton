
'use client';

import { Shield, Users, Wand, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthVideo } from '@/components/auth-video';

const features = [
    {
        icon: <Shield className="h-8 w-8 text-primary" />,
        title: "Buscador de Ayudas y Subvenciones",
        description: "Introduce tu sector y ubicación, y la IA rastreará boletines oficiales y portales de ayudas para encontrar oportunidades de financiación pública a las que puedas optar.",
        image: "https://picsum.photos/seed/coastline/800/600",
        imageLeft: true,
        aiHint: "rocky coastline"
    },
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: "Generación de Clientes Potenciales (B2B)",
        description: "Describe tu producto y tu cliente ideal. La IA analizará el mercado y te proporcionará una lista de empresas que encajan con tu perfil, incluyendo datos de contacto si son públicos.",
        image: "https://picsum.photos/seed/manhattanbridge/800/600",
        imageLeft: false,
        aiHint: "manhattan bridge"
    },
    {
        icon: <Wand className="h-8 w-8 text-primary" />,
        title: "Tutoriales para Solicitudes",
        description: "¿Has encontrado una ayuda interesante? La IA puede generar un tutorial paso a paso sobre cómo preparar la documentación y solicitarla, simplificando la burocracia.",
        image: "https://picsum.photos/seed/husky/800/600",
        imageLeft: true,
        aiHint: "husky dog"
    }
];

export function OportunidadesFeatures() {
  return (
    <div className="bg-background text-foreground">
        <section className="relative w-full h-[60vh] overflow-hidden flex items-center justify-center text-center">
            <AuthVideo />
            <div className="absolute inset-0 bg-black/60 z-10"/>
            <div className="z-20 p-4 text-white max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl/tight">
                    Tu Asistente Proactivo para Encontrar Oportunidades
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">
                    Deja de buscar manually. Draiton utiliza la IA para escanear la web y encontrar ayudas, subvenciones y nuevos clientes para tu negocio.
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
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">No Dejes Pasar ni una Oportunidad</h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
                        Activa a tu asistente personal de IA y empieza a descubrir nuevas vías de financiación y crecimiento para tu empresa.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" asChild>
                            <Link href="/seleccionar-plan">
                                Desbloquear con Plan Pro <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    </div>
  );
}
