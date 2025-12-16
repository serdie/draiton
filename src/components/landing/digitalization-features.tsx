
'use client';

import { Camera, FileUp, Sheet, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthVideo } from '@/components/auth-video';

const features = [
    {
        icon: <Camera className="h-8 w-8 text-primary" />,
        title: "Escanea Tickets y Facturas con tu Cámara",
        description: "Toma una foto de cualquier ticket o factura en papel. La IA leerá, interpretará y extraerá todos los datos clave: proveedor, fecha, importe, impuestos y conceptos.",
        image: "https://picsum.photos/seed/cityskyline/800/600",
        imageLeft: true,
        aiHint: "city skyline"
    },
    {
        icon: <FileUp className="h-8 w-8 text-primary" />,
        title: "Importa Documentos PDF",
        description: "Sube tus facturas o extractos bancarios en formato PDF. El sistema procesará el documento completo, identificando y registrando cada gasto o ingreso de forma automática.",
        image: "https://picsum.photos/seed/citystreet/800/600",
        imageLeft: false,
        aiHint: "city street sunset"
    },
    {
        icon: <Sheet className="h-8 w-8 text-primary" />,
        title: "Importación Masiva desde CSV",
        description: "¿Vienes de otro software? Exporta tus facturas o gastos a un archivo CSV y súbelo a Draiton. La IA mapeará las columnas y registrará toda tu información en segundos.",
        image: "https://picsum.photos/seed/architecture/800/600",
        imageLeft: true,
        aiHint: "abstract architecture"
    }
];

export function DigitalizationFeatures() {
  return (
    <div className="bg-background text-foreground">
        <section className="relative w-full h-[60vh] overflow-hidden flex items-center justify-center text-center">
            <AuthVideo />
            <div className="absolute inset-0 bg-black/60 z-10"/>
            <div className="z-20 p-4 text-white max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl/tight">
                    Convierte tus Papeles en Datos, al Instante
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">
                    Di adiós a la entrada manual de datos. La IA de Draiton lee tus facturas y gastos desde cualquier formato y los integra en tu contabilidad.
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ahorra Horas Cada Mes</h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
                Deja que la IA se encargue del trabajo tedioso de la entrada de datos para que tú puedas enfocarte en lo que de verdad importa: tu negocio.
            </p>
            <div className="mt-8">
                <Button size="lg" asChild>
                    <Link href="/seleccionar-plan">
                        Empezar a Automatizar <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>
    </div>
  );
}
