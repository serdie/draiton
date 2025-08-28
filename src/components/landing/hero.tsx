import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="container flex flex-col items-center justify-center py-20 text-center md:py-32 mx-auto">
      <h1 className="text-4xl font-bold tracking-tighter md:text-6xl/tight">
        Transforma la gestión de tu negocio
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Centraliza tus finanzas, marketing y operaciones con el poder de la IA. Emprende Total es la herramienta definitiva para autónomos y pymes que buscan crecer.
      </p>
      <div className="mt-8 flex gap-4">
        <Button size="lg" asChild>
          <Link href="/dashboard">Empezar Ahora</Link>
        </Button>
        <Button size="lg" variant="outline">
          <Link href="#pricing">Ver Planes</Link>
        </Button>
      </div>
    </section>
  );
}
