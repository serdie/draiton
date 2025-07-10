import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="container flex flex-col items-center justify-center py-20 text-center md:py-32">
      <h1 className="text-4xl font-bold tracking-tighter md:text-6xl/tight">
        La plataforma todo en uno para tu negocio
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Desde facturación y marketing hasta gestión de redes sociales y clientes. Emprende Total centraliza todas tus herramientas para que puedas enfocarte en crecer.
      </p>
      <div className="mt-8 flex gap-4">
        <Button size="lg" asChild>
          <Link href="/dashboard">Comienza Gratis</Link>
        </Button>
        <Button size="lg" variant="outline">
          <Link href="#features">Ver Características</Link>
        </Button>
      </div>
    </section>
  );
}
