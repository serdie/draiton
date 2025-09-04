
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fichaje } from './types';
import { format, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmployeeDayClocksProps {
    date: Date;
    fichajes: Fichaje[];
}

export function EmployeeDayClocks({ date, fichajes }: EmployeeDayClocksProps) {
    const clockIns = fichajes.filter(f => f.type === 'Entrada').sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const clockOuts = fichajes.filter(f => f.type === 'Salida').sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    let totalMinutes = 0;
    if (clockIns.length > 0 && clockOuts.length > 0) {
        const firstIn = clockIns[0].timestamp;
        const lastOut = clockOuts[clockOuts.length - 1].timestamp;
        totalMinutes = differenceInMinutes(lastOut, firstIn);
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;


    return (
        <Card>
            <CardHeader>
                <CardTitle>Fichajes del {format(date, 'PPP', { locale: es })}</CardTitle>
            </CardHeader>
            <CardContent>
                {fichajes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay fichajes para este día.</p>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                             {clockIns.map((fichaje) => (
                                <div key={fichaje.id} className="flex justify-between items-center text-sm p-2 bg-green-500/10 rounded-md">
                                    <span className="font-medium text-green-700 dark:text-green-400">Entrada</span>
                                    <span>{format(fichaje.timestamp, 'HH:mm:ss')}</span>
                                </div>
                            ))}
                             {clockOuts.map((fichaje) => (
                                <div key={fichaje.id} className="flex justify-between items-center text-sm p-2 bg-red-500/10 rounded-md">
                                    <span className="font-medium text-red-700 dark:text-red-400">Salida</span>
                                    <span>{format(fichaje.timestamp, 'HH:mm:ss')}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 text-center">
                            <p className="text-sm text-muted-foreground">Total de horas trabajadas</p>
                            <p className="text-2xl font-bold">{`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

