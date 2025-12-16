
'use client';

import { TrendingUp, FileText, Percent, AlertTriangle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthVideo } from '@/components/auth-video';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const features = [
    {
        icon: <TrendingUp className="h-8 w-8 text-primary" />,
        title: "Previsión de Impuestos en Tiempo Real",
        description: "Introduce tus ingresos y gastos deducibles del periodo. La IA calculará una estimación instantánea del IVA (Modelo 303) e IRPF (Modelo 130) que te corresponde pagar.",
        image: "https://picsum.photos/seed/skilift/800/600",
        imageLeft: true,
        aiHint: "ski lift mountains"
    },
    {
        icon: <FileText className="h-8 w-8 text-primary" />,
        title: "Guía para Rellenar Modelos",
        description: "La IA te genera una guía paso a paso, indicándote qué valor poner en cada casilla clave de los modelos fiscales más importantes, junto con una explicación clara de cada cálculo.",
        image: "https://picsum.photos/seed/beachsunset/800/600",
        imageLeft: false,
        aiHint: "beach sunset"
    },
    {
        icon: <Percent className="h-8 w-8 text-primary" />,
        title: "Optimización Fiscal",
        description: "Recibe consejos sobre posibles deducciones que podrías estar pasando por alto y asegúrate de que estás aplicando los tipos de impuestos correctos en tus facturas y gastos.",
        image: "https://picsum.photos/seed/snowymountains/800/600",
        imageLeft: true,
        aiHint: "snowy mountains"
    }
];

export function FiscalAssistantFeatures() {
  return (
    <div className="bg-background text-foreground">
        <section className="relative w-full h-[60vh] overflow-hidden flex items-center justify-center text-center">
            <AuthVideo />
            <div className="absolute inset-0 bg-black/60 z-10"/>
            <div className="z-20 p-4 text-white max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl/tight">
                    Tu Asesor Fiscal Personalizado con IA
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">
                    Anticípate a tus obligaciones fiscales. Draiton te ayuda a calcular tus impuestos y a rellenar los modelos oficiales sin errores y sin estrés.
                </p>
            </div>
        </section>

        <section className="py-20 md:py-28">
            <div className="container mx-auto space-y-20">
                {features.map((feature, index) => (
                    <div key={index} className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${feature.imageLeft ? '' : 'md:grid-flow-row-dense'}`}>
                        <div className={`relative aspect-video rounded-lg overflow-hidden shadow-lg ${feature.imageLeft ? '' : 'md:col-start-2'}`}>
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
        
        <section className="container">
            <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800 [&>svg]:text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-bold">Aviso Legal Importante</AlertTitle>
                <AlertDescription>
                    El asistente fiscal de Draiton es una herramienta de ayuda y previsión. No sustituye el consejo de un asesor fiscal profesional. La responsabilidad final sobre la presentación de impuestos recae siempre en el usuario.
                </AlertDescription>
            </Alert>
        </section>

        <section className="py-20 md:py-28 text-center container">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Gana Tranquilidad en Cada Trimestre</h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
                Evita sorpresas de última hora y cumple con tus obligaciones fiscales de forma sencilla e inteligente.
            </p>
            <div className="mt-8">
                <Button size="lg" asChild>
                    <Link href="/seleccionar-plan">
                        Empezar a Planificar <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>
    </div>
  );
}
