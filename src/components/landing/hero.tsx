
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';


export function Hero() {
  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center text-center overflow-hidden">
        <Image 
            src="https://picsum.photos/1200/800"
            alt="Persona trabajando en un ordenador con un dashboard"
            data-ai-hint="woman working computer"
            fill
            className="object-cover z-0"
        />
        <div className="absolute z-10 w-full h-full bg-black/50"></div>
        <div className="z-20 container flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-4xl font-bold tracking-tighter md:text-6xl/tight">
            Transforma la gestión de tu negocio
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
            Centraliza tus finanzas, marketing y operaciones con el poder de la IA. GestorIA es la herramienta definitiva para autónomos y pymes que buscan crecer.
            </p>
            <div className="mt-8 flex gap-4">
            <Button size="lg" asChild>
                <Link href="/dashboard">Empezar Ahora</Link>
            </Button>
            <Button size="lg" variant="secondary">
                <Link href="#pricing">Ver Planes</Link>
            </Button>
            </div>
      </div>
    </section>
  );
}
