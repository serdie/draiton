
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[60vh] md:min-h-[80vh]">
        <div className="relative h-64 md:h-auto">
             <Image 
                src="https://picsum.photos/1200/1600"
                alt="Futuristic soldier"
                data-ai-hint="futuristic soldier"
                fill
                className="object-cover"
            />
        </div>
        <div className="flex flex-col items-center justify-center bg-background p-8 text-center md:text-left md:items-start">
           <div className="max-w-md">
                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl/tight">
                Transforma la gestión de tu negocio
                </h1>
                <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Centraliza tus finanzas, marketing y operaciones con el poder de la IA. GestorIA es la herramienta definitiva para autónomos y pymes que buscan crecer.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" asChild>
                    <Link href="/dashboard">Empezar Ahora</Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                    <Link href="#pricing">Ver Planes</Link>
                </Button>
                </div>
           </div>
      </div>
      </div>
    </section>
  );
}
