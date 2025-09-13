
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Send } from 'lucide-react';
import { AiAssistantChat } from '../ai-assistant-chat';


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
           <AiAssistantChat />
        </div>
    </div>
  );
}

