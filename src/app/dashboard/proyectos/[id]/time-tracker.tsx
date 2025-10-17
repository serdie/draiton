
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FilePlus } from 'lucide-react';

// Helper function to format seconds into HH:MM:SS
const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function TimeTracker() {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    const handleStart = () => {
        if (!isRunning) {
            setIsRunning(true);
        }
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleStop = () => {
        setIsRunning(false);
        // Here you would typically save the elapsedTime to your backend
        if (elapsedTime > 0) {
            toast({
                title: "Tiempo Guardado (Simulación)",
                description: `Se han registrado ${formatTime(elapsedTime)} en este proyecto. Ahora puedes añadirlo a una factura.`,
            });
        }
    };
    
    const handleAddToInvoice = () => {
        if (elapsedTime > 0 && !isRunning) {
            toast({
                title: 'Tiempo Añadido a Factura (Simulación)',
                description: `Se ha añadido una línea de ${formatTime(elapsedTime)} a la próxima factura de este proyecto.`
            });
            setElapsedTime(0); // Reset after adding to invoice
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Seguimiento de Tiempo</CardTitle>
                <CardDescription>Registra el tiempo dedicado a este proyecto.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <div className="text-4xl font-bold font-mono">{formatTime(elapsedTime)}</div>
                <div className="flex gap-2">
                    <Button onClick={handleStart} disabled={isRunning}>Iniciar</Button>
                    <Button variant="outline" onClick={handlePause} disabled={!isRunning}>Pausar</Button>
                    <Button variant="destructive" onClick={handleStop} disabled={elapsedTime === 0}>Detener</Button>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
                 <p className="text-sm text-muted-foreground">Detén el cronómetro para guardar el tiempo y añadirlo a una factura.</p>
                 <Button onClick={handleAddToInvoice} disabled={elapsedTime === 0 || isRunning}>
                    <FilePlus className="mr-2 h-4 w-4"/>
                    Añadir a Factura
                 </Button>
            </CardFooter>
        </Card>
    );
}
