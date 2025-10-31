

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fichaje } from './types';
import { format, differenceInMinutes, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmployeeDayClocksProps {
    date: Date;
    fichajes: Fichaje[];
}

export function EmployeeDayClocks({ date, fichajes }: EmployeeDayClocksProps) {
    const sortedFichajes = fichajes.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    const clockIns = sortedFichajes.filter(f => f.type === 'Entrada');
    const clockOuts = sortedFichajes.filter(f => f.type === 'Salida');

    let totalMinutes = 0;
    if (clockIns.length > 0 && clockOuts.length > 0) {
        const firstIn = clockIns[0].timestamp;
        const lastOut = clockOuts[clockOuts.length - 1].timestamp;
        totalMinutes = differenceInMinutes(lastOut, firstIn);
        
        // Restar descansos
        for (let i = 0; i < sortedFichajes.length - 1; i++) {
            if (sortedFichajes[i].type === 'Inicio Descanso' && sortedFichajes[i+1]?.type === 'Fin Descanso') {
                totalMinutes -= differenceInMinutes(sortedFichajes[i+1].timestamp, sortedFichajes[i].timestamp);
            }
        }
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const renderFichaje = (fichaje: Fichaje) => {
        let bgColor = '';
        let textColor = '';
        switch(fichaje.type) {
            case 'Entrada':
                bgColor = 'bg-green-500/10';
                textColor = 'text-green-700 dark:text-green-400';
                break;
            case 'Salida':
                bgColor = 'bg-red-500/10';
                textColor = 'text-red-700 dark:text-red-400';
                break;
            case 'Inicio Descanso':
                bgColor = 'bg-blue-500/10';
                textColor = 'text-blue-500 dark:text-blue-400';
                break;
            case 'Fin Descanso':
                 bgColor = 'bg-blue-800/10 dark:bg-blue-400/20';
                 textColor = 'text-blue-800 dark:text-blue-300';
                 break;
        }
        return (
             <div key={fichaje.id} className={`flex justify-between items-center text-sm p-2 rounded-md ${bgColor}`}>
                <span className={`font-medium ${textColor}`}>{fichaje.type}</span>
                <span>{format(fichaje.timestamp, 'HH:mm:ss')}</span>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fichajes del {format(date, 'PPP', { locale: es })}</CardTitle>
            </CardHeader>
            <CardContent>
                {sortedFichajes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay fichajes para este día.</p>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                             {sortedFichajes.map(renderFichaje)}
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
