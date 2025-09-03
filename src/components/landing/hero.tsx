
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const videos = [
    { src: "https://www.diemy.es/wp-content/uploads/2025/09/IA_para_Crecimiento_Empresarial-1.mp4", type: "video/mp4" },
    { src: "https://www.diemy.es/wp-content/uploads/2025/09/It_generates_a_202509031621_c6ev2.mp4", type: "video/mp4" }
];

export function Hero() {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoRefs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];

    const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    useEffect(() => {
        videoRefs.forEach((ref, index) => {
            const videoElement = ref.current;
            if (videoElement) {
                if (index === currentVideoIndex) {
                    videoElement.play();
                } else {
                    videoElement.pause();
                    videoElement.currentTime = 0;
                }
            }
        });
    }, [currentVideoIndex, videoRefs]);
    

  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center text-center overflow-hidden">
        {videos.map((video, index) => (
             <video 
                key={index}
                ref={videoRefs[index]}
                muted 
                playsInline
                className={cn(
                    "absolute z-0 w-full h-full object-cover transition-opacity duration-1000",
                    index === currentVideoIndex ? "opacity-100" : "opacity-0"
                )}
                onEnded={handleVideoEnd}
                poster="https://picsum.photos/seed/hero/1920/1080"
                data-ai-hint="abstract background"
            >
                <source src={video.src} type={video.type} />
            </video>
        ))}
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
