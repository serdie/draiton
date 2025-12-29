
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fichaje } from './types';
import { format, differenceInMinutes, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, ArrowRight, Eye } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';

interface EmployeeDayClocksProps {
    date: Date;
    fichajes: Fichaje[];
    onViewFichaje: (fichaje: Fichaje) => void;
}

const getTypeClass = (type: Fichaje['type']) => {
    switch(type) {
        case 'Entrada': return { bg: 'bg-green-500/10', text: 'text-green-700 dark:text-green-400' };
        case 'Salida': return { bg: 'bg-red-500/10', text: 'text-red-700 dark:text-red-400' };
        case 'Inicio Descanso': return { bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400' };
        case 'Fin Descanso': return { bg: 'bg-blue-800/10 dark:bg-blue-400/20', text: 'text-blue-800 dark:text-blue-300' };
        default: return { bg: 'bg-gray-500/10', text: 'text-gray-700 dark:text-gray-400' };
    }
}


export function EmployeeDayClocks({ date, fichajes, onViewFichaje }: EmployeeDayClocksProps) {
    const { toast } = useToast();
    const { user } = useContext(AuthContext);
    const sortedFichajes = [...fichajes].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    const clockIns = sortedFichajes.filter(f => f.type === 'Entrada');
    const clockOuts = sortedFichajes.filter(f => f.type === 'Salida');

    let totalMinutes = 0;
    const firstIn = clockIns[0]?.timestamp;
    const lastOut = clockOuts[clockOuts.length - 1]?.timestamp;

    if (firstIn && lastOut && isValid(firstIn) && isValid(lastOut) && firstIn < lastOut) {
        totalMinutes = differenceInMinutes(lastOut, firstIn);
    
        // Restar descansos
        let breakStartTime: Date | null = null;
        for (const fichaje of sortedFichajes) {
            if (fichaje.type === 'Inicio Descanso' && isValid(fichaje.timestamp) && fichaje.timestamp > firstIn && fichaje.timestamp < lastOut) {
                breakStartTime = fichaje.timestamp;
            }
            if (fichaje.type === 'Fin Descanso' && isValid(fichaje.timestamp) && breakStartTime && fichaje.timestamp > breakStartTime) {
                totalMinutes -= differenceInMinutes(fichaje.timestamp, breakStartTime);
                breakStartTime = null; // Reset for next break
            }
        }
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    const handleRequest = async (fichajeId: string, approved: boolean) => {
        const fichajeRef = doc(db, 'fichajes', fichajeId);
        const fichajeToUpdate = fichajes.find(f => f.id === fichajeId);
        if (!fichajeToUpdate || !user) return;
        
        const updateData: any = {
            requestStatus: approved ? 'approved' : 'rejected'
        };

        if (approved && fichajeToUpdate.requestedTimestamp) {
            updateData.timestamp = fichajeToUpdate.requestedTimestamp;
        }

        try {
            await updateDoc(fichajeRef, updateData);

            // Crear notificación para el empleado
            await addDoc(collection(db, 'notifications'), {
                recipientId: fichajeToUpdate.employeeId,
                senderId: user.uid,
                senderName: user.displayName,
                type: 'FICHAGE_CHANGE_RESPONSE',
                message: `ha ${approved ? 'aprobado' : 'rechazado'} tu solicitud de cambio de fichaje.`,
                link: '/dashboard/proyectos?tab=fichajes', // Link para el portal del empleado
                isRead: false,
                createdAt: serverTimestamp(),
            });

            toast({ title: 'Solicitud gestionada', description: `La solicitud de cambio ha sido ${approved ? 'aprobada' : 'rechazada'}.` });
        } catch(error) {
            console.error("Error al gestionar solicitud:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar la solicitud.' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Fichajes del {isValid(date) ? format(date, 'PPP', { locale: es }) : 'Fecha inválida'}</CardTitle>
            </CardHeader>
            <CardContent>
                {sortedFichajes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay fichajes para este día.</p>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                             {sortedFichajes.map((fichaje) => {
                                 if (!fichaje.timestamp || !isValid(fichaje.timestamp)) {
                                     return null; // Don't render if timestamp is invalid
                                 }
                                 const { bg, text } = getTypeClass(fichaje.type);
                                 return (
                                     <div key={fichaje.id}>
                                         <div className={`flex justify-between items-center text-sm p-2 rounded-md ${bg}`}>
                                             <div className="flex items-center gap-2">
                                                <span className={`font-medium ${text}`}>{fichaje.type}</span>
                                                <span>{format(fichaje.timestamp, 'HH:mm:ss')}</span>
                                             </div>
                                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewFichaje(fichaje)}>
                                                 <Eye className="h-4 w-4" />
                                             </Button>
                                         </div>
                                         {fichaje.requestStatus === 'pending' && (
                                            <Alert variant="default" className="mt-2 border-yellow-500/50 bg-yellow-500/10">
                                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                                                <AlertTitle className="text-yellow-700">Solicitud de Cambio Pendiente</AlertTitle>
                                                <AlertDescription className="text-yellow-600">
                                                    <p>Motivo: <span className="italic">{fichaje.requestChangeReason}</span></p>
                                                    <div className="flex items-center gap-2 font-semibold">
                                                        Hora original: {format(fichaje.timestamp, 'HH:mm')}
                                                        <ArrowRight className="h-4 w-4"/>
                                                        Hora solicitada: {fichaje.requestedTimestamp && isValid(fichaje.requestedTimestamp) ? format(fichaje.requestedTimestamp, 'HH:mm') : 'N/A'}
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <Button size="sm" onClick={() => handleRequest(fichaje.id, true)}>Aprobar</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => handleRequest(fichaje.id, false)}>Rechazar</Button>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                         )}
                                     </div>
                                 )
                             })}
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
