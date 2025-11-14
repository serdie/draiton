

'use client';

import { useState, useContext, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2, Power, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, Timestamp, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format, getDay, set, addMinutes, subMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { FichajeHistory } from '../../proyectos/fichaje-history';
import type { Employee, Fichaje, BreakDetails, WorkDay, TimeSlot } from './types';
import { StartBreakModal } from './start-break-modal';
import { SelectWorkModalityModal } from './select-work-modality-modal';
import { AuthContext } from '@/context/auth-context';


type FichajeStatus = 'out' | 'in';
type BreakStatus = 'working' | 'on_break';
type PostModalityAction = 'Entrada' | 'Fin Descanso';

// Helper to check if current time is within any of the time slots for the day, including courtesy margin
const isWithinScheduleWithMargin = (workDay?: WorkDay, margin: number = 0): boolean => {
    if (!workDay || workDay.type === 'no-laboral' || !workDay.timeSlots) {
        // If there is no schedule defined for the day, we can consider it "within schedule" to not block clock-ins.
        // The incidence logic will handle the notification.
        return true; 
    }
    const now = new Date();
    
    return workDay.timeSlots.some(slot => {
        const [startHours, startMinutes] = slot.start.split(':').map(Number);
        const [endHours, endMinutes] = slot.end.split(':').map(Number);
        
        const baseStartTime = set(now, { hours: startHours, minutes: startMinutes, seconds: 0, milliseconds: 0 });
        const baseEndTime = set(now, { hours: endHours, minutes: endMinutes, seconds: 0, milliseconds: 0 });
        
        // Apply courtesy margin
        const startTimeWithMargin = subMinutes(baseStartTime, margin);
        const endTimeWithMargin = addMinutes(baseEndTime, margin);


        return now >= startTimeWithMargin && now <= endTimeWithMargin;
    });
};


export function FichajeEmpleadoTab() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [status, setStatus] = useState<FichajeStatus | 'loading'>('loading');
    const [breakStatus, setBreakStatus] = useState<BreakStatus>('working');
    const [lastFichajeTime, setLastFichajeTime] = useState<string | null>(null);
    const [allFichajes, setAllFichajes] = useState<Fichaje[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
    const [isWorkModalityModalOpen, setIsWorkModalityModalOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
    const [postModalityAction, setPostModalityAction] = useState<PostModalityAction | null>(null);

    // Effect to get current employee profile
    useEffect(() => {
        if (!user) return;
        const employeeDocRef = doc(db, 'employees', user.uid);
        const unsubscribe = onSnapshot(employeeDocRef, (doc) => {
            if (doc.exists()) {
                setCurrentEmployee({ id: doc.id, ...doc.data() } as Employee);
            }
        });
        return () => unsubscribe();
    }, [user]);

    // Effect to determine initial status and load all fichajes
    useEffect(() => {
        if (!user?.uid) {
            setStatus('out');
            setBreakStatus('working');
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'fichajes'),
            where('employeeId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fichajesList: Fichaje[] = snapshot.docs.map(doc => {
                 const data = doc.data();
                 return {
                    id: doc.id,
                    ...data,
                    timestamp: (data.timestamp as Timestamp).toDate(),
                    requestedTimestamp: data.requestedTimestamp ? (data.requestedTimestamp as Timestamp).toDate() : undefined,
                    requestedAt: data.requestedAt ? (data.requestedAt as Timestamp).toDate() : undefined,
                 } as Fichaje;
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
             setLoading(false);
        }, (error) => {
            console.error("Error al obtener el estado de fichaje:", error);
            setStatus('out');
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid]);

    const handleClockIn = () => {
        if (!currentEmployee) return;
        if (currentEmployee.workModality === 'Mixto') {
            setPostModalityAction('Entrada');
            setIsWorkModalityModalOpen(true);
        } else {
            handleFichaje('Entrada', undefined, currentEmployee.workModality);
        }
    };
    
    const handleEndBreak = () => {
        if (!currentEmployee) return;
        if (currentEmployee.workModality === 'Mixto') {
            setPostModalityAction('Fin Descanso');
            setIsWorkModalityModalOpen(true);
        } else {
            handleFichaje('Fin Descanso');
        }
    };

    const handleWorkModalitySelected = (modality: 'Presencial' | 'Teletrabajo') => {
        if (postModalityAction) {
            handleFichaje(postModalityAction, undefined, modality);
        }
        setIsWorkModalityModalOpen(false);
        setPostModalityAction(null);
    };

    const handleFichaje = async (type: Fichaje['type'], details?: BreakDetails, workModality?: 'Presencial' | 'Teletrabajo') => {
        if (!user || !user.uid || !currentEmployee || status === 'loading' || isProcessing) {
            toast({ variant: 'destructive', title: 'Acción no válida', description: 'Por favor, espera a que finalice la operación actual o recarga la página.' });
            return;
        }

        const companyOwnerId = currentEmployee.ownerId;
        if (!companyOwnerId) {
            toast({ variant: 'destructive', title: 'Error de Configuración', description: 'Tu usuario no está vinculado a ninguna empresa.' });
            return;
        }
        
        setIsProcessing(true);

        const now = new Date();
        const todayIndex = (now.getDay() + 6) % 7;
        const dayKey = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][todayIndex] as keyof WorkSchedule;
        const todaySchedule = currentEmployee.workSchedule?.[dayKey];
        const isStrict = currentEmployee.strictSchedule ?? false;
        const margin = currentEmployee.courtesyMargin ?? 0;

        let incidence: string | null = null;
        if (isStrict && todaySchedule && todaySchedule.type !== 'no-laboral') {
            const isWithinTime = isWithinScheduleWithMargin(todaySchedule, margin);
            if (!isWithinTime && (type === 'Entrada' || type === 'Salida')) {
                incidence = `${type} fuera de horario`;
            }
        }


        const fichajeData: any = {
            employeeId: user.uid,
            ownerId: companyOwnerId,
            employeeName: user.displayName,
            type: type,
            timestamp: serverTimestamp(),
            incidence: incidence,
        };

        if (details) {
            fichajeData.breakDetails = details;
        }
        if (workModality) {
            fichajeData.workModality = workModality;
        }

        try {
            await addDoc(collection(db, 'fichajes'), fichajeData);

            if (incidence) {
                // TODO: Enviar notificación al manager (dueño de la empresa)
                console.log(`Incidencia registrada: ${incidence}. Se debe notificar a ${companyOwnerId}.`);
                 toast({
                    variant: "destructive",
                    title: 'Fichaje Fuera de Horario',
                    description: `Se ha registrado una incidencia por fichar ${type.toLowerCase()} fuera de tu horario laboral.`,
                });
            } else {
                toast({
                    title: `Fichaje de ${type} registrado`,
                    description: `Has registrado tu ${type.toLowerCase()} a las ${format(new Date(), 'HH:mm')}.`,
                });
            }

        } catch (error) {
            console.error("Error al registrar fichaje:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo registrar el fichaje. Revisa las reglas de seguridad.' });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleStartBreak = async (details: BreakDetails) => {
       await handleFichaje('Inicio Descanso', details);
       setIsBreakModalOpen(false);
    };

    const isClockIn = status === 'in';
    const isOnBreak = breakStatus === 'on_break';
    const isLoading = status === 'loading';
    
    // La lógica de deshabilitar el botón se ha eliminado para permitir siempre el fichaje,
    // la validación se hace ahora en `handleFichaje` para registrar incidencias.
    const clockInDisabled = isLoading || isProcessing || isOnBreak;
    const clockOutDisabled = isLoading || isProcessing || isOnBreak;


    return (
        <>
        <StartBreakModal 
            isOpen={isBreakModalOpen}
            onClose={() => setIsBreakModalOpen(false)}
            onSubmit={handleStartBreak}
            isSubmitting={isProcessing}
        />
        <SelectWorkModalityModal
            isOpen={isWorkModalityModalOpen}
            onClose={() => setIsWorkModalityModalOpen(false)}
            onSelect={handleWorkModalitySelected}
        />
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
                            onClick={() => (isClockIn ? handleFichaje('Salida') : handleClockIn())}
                            disabled={clockInDisabled}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (isClockIn ? <LogOut className="mr-2 h-5 w-5"/> : <LogIn className="mr-2 h-5 w-5"/>) }
                            {isProcessing ? 'Registrando...' : (isClockIn ? 'Fichar Salida' : 'Fichar Entrada')}
                        </Button>
                         <Button
                            size="lg"
                            variant="outline"
                            className="w-full"
                            onClick={() => isOnBreak ? handleEndBreak() : setIsBreakModalOpen(true)}
                            disabled={isLoading || isProcessing || !isClockIn}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Coffee className="mr-2 h-5 w-5" />}
                            {isOnBreak ? 'Finalizar Descanso' : 'Iniciar Descanso'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <FichajeHistory allFichajes={allFichajes} />
        </div>
        </>
    );
}
