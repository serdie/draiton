import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center text-center overflow-hidden">
        <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="absolute z-0 w-full h-full object-cover"
            poster="https://picsum.photos/seed/hero/1920/1080"
            data-ai-hint="abstract background"
        >
            <source src="https://videos.pexels.com/video-files/3209828/3209828-hd.mp4" type="video/mp4" />
        </video>
      <div className="absolute z-10 w-full h-full bg-black/50"></div>
      <div className="z-20 container flex flex-col items-center justify-center text-white px-4">
        <h1 className="text-4xl font-bold tracking-tighter md:text-6xl/tight">
          Transforma la gestión de tu negocio
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/80">
          Centraliza tus finanzas, marketing y operaciones con el poder de la IA. Emprende Total es la herramienta definitiva para autónomos y pymes que buscan crecer.
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
