
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FilePlus, Briefcase } from 'lucide-react';
import { type Task } from '../../tareas/types';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// Helper function to format seconds into HH:MM:SS
const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export function TimeTracker({ tasks }: { tasks: Task[] }) {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
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
        if (elapsedTime > 0) {
            toast({
                title: "Cronómetro detenido",
                description: `Tiempo registrado: ${formatTime(elapsedTime)}. Ahora puedes asignarlo a una tarea o factura.`,
            });
        }
    };
    
    const handleAddToInvoice = () => {
        if (elapsedTime > 0 && !isRunning) {
            toast({
                title: 'Tiempo Añadido a Factura (Simulación)',
                description: `Se ha añadido una línea de ${formatTime(elapsedTime)} a la próxima factura de este proyecto.`
            });
            setElapsedTime(0);
        }
    }
    
    const handleAssignToTask = async () => {
        if (!selectedTaskId || elapsedTime === 0 || isRunning) {
            toast({
                variant: 'destructive',
                title: 'Acción no válida',
                description: 'Por favor, detén el cronómetro, registra algo de tiempo y selecciona una tarea.',
            });
            return;
        }

        const taskRef = doc(db, 'tasks', selectedTaskId);
        try {
            await updateDoc(taskRef, {
                timeTracked: increment(elapsedTime)
            });
            toast({
                title: 'Tiempo Asignado',
                description: `Se han añadido ${formatTime(elapsedTime)} a la tarea seleccionada.`
            });
            setElapsedTime(0);
            setSelectedTaskId(null);
        } catch (error) {
            console.error("Error al asignar tiempo a la tarea:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo guardar el tiempo en la tarea.',
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Seguimiento de Tiempo</CardTitle>
                <CardDescription>Registra el tiempo dedicado a este proyecto y asígnalo a tareas específicas.</CardDescription>
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
                 <p className="text-sm text-muted-foreground">Detén el cronómetro para guardar el tiempo y añadirlo a una factura o tarea.</p>
                 <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Button onClick={handleAddToInvoice} disabled={elapsedTime === 0 || isRunning} className="w-full sm:w-auto">
                        <FilePlus className="mr-2 h-4 w-4"/>
                        Añadir a Factura
                    </Button>
                     <div className="flex gap-2 w-full sm:w-auto">
                        <Select onValueChange={setSelectedTaskId} value={selectedTaskId || ''}>
                             <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Seleccionar tarea..." />
                             </SelectTrigger>
                             <SelectContent>
                                {tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <SelectItem key={task.id} value={task.id}>{task.title}</SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-muted-foreground">No hay tareas en este proyecto.</div>
                                )}
                             </SelectContent>
                        </Select>
                        <Button onClick={handleAssignToTask} disabled={!selectedTaskId || elapsedTime === 0 || isRunning}>
                             <Briefcase className="mr-2 h-4 w-4"/>
                            Añadir a Tarea
                        </Button>
                    </div>
                 </div>
            </CardFooter>
        </Card>
    );
}
