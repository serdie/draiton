
'use client';

import { User, Clock, CalendarCheck, BarChart, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AuthVideo } from '@/components/auth-video';

const features = [
    {
        icon: <User className="h-8 w-8 text-primary" />,
        title: "Portal del Empleado Intuitivo",
        description: "Cada empleado tiene su propio espacio para fichar, consultar su horario, solicitar vacaciones y ver sus nóminas. Fácil de usar desde cualquier dispositivo.",
        image: "https://picsum.photos/seed/spiderweb/800/600",
        imageLeft: true,
        aiHint: "spiderweb on tree"
    },
    {
        icon: <Clock className="h-8 w-8 text-primary" />,
        title: "Fichaje Flexible y Confiable",
        description: "Permite a tus empleados registrar su jornada con un solo clic. El sistema gestiona entradas, salidas y pausas (personales o de jornada partida) para un registro preciso.",
        image: "https://picsum.photos/seed/skyscraper/800/600",
        imageLeft: false,
        aiHint: "skyscraper from below"
    },
    {
        icon: <CalendarCheck className="h-8 w-8 text-primary" />,
        title: "Gestión de Ausencias Centralizada",
        description: "Administra vacaciones, bajas por enfermedad y otros días libres. Los empleados solicitan ausencias y tú las apruebas o rechazas con un clic, manteniendo el calendario del equipo siempre actualizado.",
        image: "https://picsum.photos/seed/bar/800/600",
        imageLeft: true,
        aiHint: "people at bar"
    },
    {
        icon: <BarChart className="h-8 w-8 text-primary" />,
        title: "Informes y Control para la Empresa",
        description: "Como administrador, tienes una visión completa: supervisa las horas trabajadas por cada empleado, gestiona solicitudes de cambio de fichajes y exporta informes detallados para cumplir con la normativa laboral sin esfuerzo.",
        image: "https://picsum.photos/seed/buildingfacade/800/600",
        imageLeft: false,
        aiHint: "building facade"
    }
];

export function TimeTrackingFeatures() {
  return (
    <div className="bg-background text-foreground">
        <section className="relative w-full h-[60vh] overflow-hidden flex items-center justify-center text-center">
            <AuthVideo />
            <div className="absolute inset-0 bg-black/60 z-10"/>
            <div className="z-20 p-4 text-white max-w-4xl">
                <h1 className="text-4xl font-bold tracking-tighter md:text-5xl/tight">
                    Optimiza la Gestión de tu Equipo con el Control Horario Integrado
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-white/80">
                    Cumple con la normativa, simplifica la administración de personal y dale a tu equipo la autonomía que necesita. Todo desde Draiton.
                </p>
            </div>
        </section>

        <section className="py-20 md:py-28">
            <div className="container mx-auto space-y-20">
                {features.map((feature, index) => (
                    <div key={index} className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${feature.imageLeft ? '' : 'md:grid-flow-row-dense'}`}>
                        <div className={`relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg ${feature.imageLeft ? '' : 'md:col-start-2'}`}>
                            <Image src={feature.image} alt={feature.title} fill className="object-cover" data-ai-hint={feature.aiHint}/>
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
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">La solución completa para la gestión de equipos</h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
                Desde el fichaje diario hasta la gestión de nóminas, el Plan Empresa de Draiton centraliza todas las herramientas que necesitas.
            </p>
            <div className="mt-8">
                <Button size="lg" asChild>
                    <Link href="/seleccionar-plan?plan=empresa">
                        Ver Planes de Empresa <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>
    </div>
  );
}
