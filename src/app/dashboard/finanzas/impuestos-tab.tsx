
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Send } from 'lucide-react';


const taxModels = [
    { name: 'Modelo 303 (IVA Trimestral)', link: '/dashboard/gestor-ia/asistente-fiscal?modelo=303' },
    { name: 'Modelo 130 (IRPF Trimestral)', link: '/dashboard/gestor-ia/asistente-fiscal?modelo=130' },
    { name: 'Modelo 111 (Retenciones)', link: '/dashboard/gestor-ia/asistente-fiscal?modelo=111' },
    { name: 'Modelo 115 (Alquileres)', link: '/dashboard/gestor-ia/asistente-fiscal?modelo=115' },
]

export function ImpuestosTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Previsión 3er Trimestre</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">IVA a pagar</span>
                        <span className="font-bold text-lg">1.845,20€</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">IRPF a cuenta</span>
                        <span className="font-bold text-lg">975,50€</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between items-baseline text-primary">
                        <span className="font-semibold">Total a liquidar</span>
                        <span className="font-bold text-2xl">2.820,70€</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Modelos Tributarios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                   {taxModels.map((model) => (
                        <div key={model.name} className="flex justify-between items-center p-2 hover:bg-muted rounded-md">
                            <span className="text-sm">{model.name}</span>
                            <Button asChild variant="link" className="pr-0">
                                <Link href={model.link}>Preparar</Link>
                            </Button>
                        </div>
                   ))}
                </CardContent>
            </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary"/>
                        Asistente IA
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col gap-4">
                    <div className="p-4 bg-secondary rounded-lg flex items-start gap-3 w-fit max-w-lg">
                        <div className="flex-shrink-0 size-8 bg-primary/20 text-primary flex items-center justify-center rounded-full">
                           <Sparkles className="h-5 w-5"/>
                        </div>
                        <p className="text-sm text-secondary-foreground pt-1.5">
                            ¡Hola! Soy GestorIA. Pregúntame sobre impuestos, facturas, o cómo optimizar tu negocio.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="relative w-full">
                        <Input placeholder="Escribe tu consulta..." className="pr-12 h-12" />
                        <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
