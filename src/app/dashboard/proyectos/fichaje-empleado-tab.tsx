
'use client';

import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2, Power } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type FichajeStatus = 'out' | 'in';

export function FichajeEmpleadoTab() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [status, setStatus] = useState<FichajeStatus | 'loading'>('loading');
    const [lastFichajeTime, setLastFichajeTime] = useState<string | null>(null);

    // Effect to determine initial status
    useEffect(() => {
        if (!user) {
            setStatus('out');
            return;
        };

        const q = query(
            collection(db, 'fichajes'),
            where('employeeId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const lastFichaje = snapshot.docs[0].data();
                setStatus(lastFichaje.type === 'Entrada' ? 'in' : 'out');
                setLastFichajeTime(format(lastFichaje.timestamp.toDate(), "dd MMM, yyyy 'a las' HH:mm", { locale: es }));
            } else {
                setStatus('out');
                setLastFichajeTime(null);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleFichaje = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error de autenticación' });
            return;
        }

        const newType = status === 'out' ? 'Entrada' : 'Salida';

        try {
            await addDoc(collection(db, 'fichajes'), {
                employeeId: user.uid,
                employeeName: user.displayName,
                type: newType,
                timestamp: serverTimestamp(),
            });
            toast({
                title: `Fichaje de ${newType} registrado`,
                description: `Has registrado tu ${newType.toLowerCase()} a las ${format(new Date(), 'HH:mm')}.`,
            });
        } catch (error) {
            console.error("Error al registrar fichaje:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo registrar el fichaje.' });
        }
    };

    const isClockIn = status === 'in';
    const isLoading = status === 'loading';

    return (
        <div className="flex justify-center items-center h-full">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Control de Jornada</CardTitle>
                <CardDescription>Registra tu entrada y salida del trabajo.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <div className={`p-6 rounded-full ${isClockIn ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    <div className={`p-4 rounded-full ${isClockIn ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                       {isLoading ? <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /> : <Power className={`h-16 w-16 ${isClockIn ? 'text-green-500' : 'text-red-500'}`} />}
                    </div>
                </div>
                 <div className="text-center">
                    <p className="font-semibold text-xl">
                        {isLoading ? 'Cargando estado...' : (isClockIn ? 'Actualmente DENTRO' : 'Actualmente FUERA')}
                    </p>
                    {lastFichajeTime && !isLoading && (
                        <p className="text-sm text-muted-foreground">
                            Último fichaje: {lastFichajeTime}
                        </p>
                    )}
                 </div>
                <Button 
                    size="lg" 
                    className={`w-full ${isClockIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    onClick={handleFichaje}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isClockIn ? <LogOut className="mr-2 h-5 w-5"/> : <LogIn className="mr-2 h-5 w-5"/>) }
                    {isLoading ? 'Cargando...' : (isClockIn ? 'Fichar Salida' : 'Fichar Entrada')}
                </Button>
            </CardContent>
        </Card>
        </div>
    );
}
