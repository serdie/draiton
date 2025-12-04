
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthVideo } from '@/components/auth-video';

export function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden flex items-center justify-center text-center">
        <AuthVideo />
        <div className="absolute inset-0 bg-black/50 z-10"/>
        <div className="z-20 p-4 text-white max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tighter md:text-6xl/tight">
            Transforma la gestión de tu negocio
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">
            Centraliza tus finanzas, marketing y operaciones con el poder de la IA. Draiton es la herramienta definitiva para autónomos y pymes que buscan crecer.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
                <Link href="/dashboard">Empezar Ahora</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
                <Link href="#pricing">Ver Planes</Link>
            </Button>
            </div>
        </div>
    </section>
  );
}
