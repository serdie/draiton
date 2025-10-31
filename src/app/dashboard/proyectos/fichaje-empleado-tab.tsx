
'use client';

import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2, Power, Coffee } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FichajeHistory } from './fichaje-history';
import type { Fichaje } from './types';


type FichajeStatus = 'out' | 'in';
type BreakStatus = 'working' | 'on_break';

export function FichajeEmpleadoTab() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [status, setStatus] = useState<FichajeStatus | 'loading'>('loading');
    const [breakStatus, setBreakStatus] = useState<BreakStatus>('working');
    const [lastFichajeTime, setLastFichajeTime] = useState<string | null>(null);
    const [allFichajes, setAllFichajes] = useState<Fichaje[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Effect to determine initial status and load all fichajes
    useEffect(() => {
        if (!user?.uid) {
            setStatus('out');
            setBreakStatus('working');
            return;
        };

        const q = query(
            collection(db, 'fichajes'),
            where('employeeId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fichajesList: Fichaje[] = [];
            snapshot.forEach(doc => {
                 const data = doc.data();
                 fichajesList.push({
                    id: doc.id,
                    ...data,
                    timestamp: (data.timestamp as Timestamp).toDate(),
                 } as Fichaje)
            });
            
            fichajesList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
            
            setAllFichajes(fichajesList);

            if (fichajesList.length > 0) {
                const lastFichaje = fichajesList[0];
                setLastFichajeTime(format(lastFichaje.timestamp, "dd MMM, yyyy 'a las' HH:mm", { locale: es }));
                
                if (lastFichaje.type === 'Entrada') {
                    setStatus('in');
                    setBreakStatus('working');
                } else if (lastFichaje.type === 'Salida') {
                    setStatus('out');
                    setBreakStatus('working');
                } else if (lastFichaje.type === 'Inicio Descanso') {
                    setStatus('in');
                    setBreakStatus('on_break');
                } else if (lastFichaje.type === 'Fin Descanso') {
                    setStatus('in');
                    setBreakStatus('working');
                }
            } else {
                setStatus('out');
                setBreakStatus('working');
                setLastFichajeTime(null);
            }
        }, (error) => {
            console.error("Error al obtener el estado de fichaje:", error);
            setStatus('out');
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const handleFichaje = async (type: 'Entrada' | 'Salida' | 'Inicio Descanso' | 'Fin Descanso') => {
        if (!user || !user.uid || status === 'loading' || isProcessing) {
            toast({ variant: 'destructive', title: 'Acción en progreso', description: 'Por favor, espera a que finalice la operación actual.' });
            return;
        }

        const companyOwnerId = (user as any).companyOwnerId;
        if (!companyOwnerId) {
            toast({ variant: 'destructive', title: 'Error de Configuración', description: 'Tu usuario no está vinculado a ninguna empresa.' });
            return;
        }
        
        setIsProcessing(true);

        try {
            await addDoc(collection(db, 'fichajes'), {
                employeeId: user.uid,
                ownerId: companyOwnerId,
                employeeName: user.displayName,
                type: type,
                timestamp: serverTimestamp(),
            });

            toast({
                title: `Fichaje de ${type} registrado`,
                description: `Has registrado tu ${type.toLowerCase()} a las ${format(new Date(), 'HH:mm')}.`,
            });
        } catch (error) {
            console.error("Error al registrar fichaje:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo registrar el fichaje. Revisa las reglas de seguridad.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const isClockIn = status === 'in';
    const isOnBreak = breakStatus === 'on_break';
    const isLoading = status === 'loading';

    return (
        <div className="space-y-6">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Control de Jornada</CardTitle>
                    <CardDescription>Registra tu entrada, salida y descansos.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    <div className={`p-6 rounded-full ${isClockIn ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <div className={`p-4 rounded-full ${isClockIn ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        {isLoading ? <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /> : <Power className={`h-16 w-16 ${isClockIn ? 'text-green-500' : 'text-red-500'}`} />}
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-xl">
                            {isLoading ? 'Cargando estado...' : (isClockIn ? (isOnBreak ? 'EN DESCANSO' : 'Actualmente DENTRO') : 'Actualmente FUERA')}
                        </p>
                        {lastFichajeTime && !isLoading && (
                            <p className="text-sm text-muted-foreground">
                                Último fichaje: {lastFichajeTime}
                            </p>
                        )}
                    </div>
                    <div className="w-full space-y-2">
                        <Button 
                            size="lg" 
                            className={`w-full ${isClockIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                            onClick={() => handleFichaje(isClockIn ? 'Salida' : 'Entrada')}
                            disabled={isLoading || isProcessing || isOnBreak}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isClockIn ? <LogOut className="mr-2 h-5 w-5"/> : <LogIn className="mr-2 h-5 w-5"/>) }
                            {isProcessing ? 'Registrando...' : (isClockIn ? 'Fichar Salida' : 'Fichar Entrada')}
                        </Button>
                         <Button
                            size="lg"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleFichaje(isOnBreak ? 'Fin Descanso' : 'Inicio Descanso')}
                            disabled={isLoading || isProcessing || !isClockIn}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Coffee className="mr-2 h-5 w-5" />}
                            {isOnBreak ? 'Finalizar Descanso' : 'Iniciar Descanso'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <FichajeHistory fichajes={allFichajes} />
        </div>
    );
}
