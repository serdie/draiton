
'use client';

import { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AuthContext } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import type { Absence, AbsenceStatus } from '../finanzas/empleados/types';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { eachDayOfInterval, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const getAbsenceTypeColor = (type: Absence['type']) => {
    switch (type) {
        case 'Vacaciones': return 'bg-blue-500';
        case 'Baja por enfermedad': return 'bg-orange-500';
        case 'Paternidad/Maternidad': return 'bg-purple-500';
        case 'Día propio': return 'bg-green-500';
        case 'Festivo': return 'bg-indigo-500';
        default: return 'bg-gray-500';
    }
};

export function EmployeeAbsenceCalendar() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const absencesQuery = query(
            collection(db, 'absences'),
            where('employeeId', '==', user.uid),
            orderBy('startDate', 'desc')
        );

        const unsubscribe = onSnapshot(absencesQuery, (snapshot) => {
            const fetchedAbsences = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : new Date(data.startDate),
                    endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : new Date(data.endDate),
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
                } as Absence;
            });
            setAbsences(fetchedAbsences);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching absences:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar tus ausencias.'});
            setLoading(false);
        });
        
        return () => unsubscribe();
    }, [user, toast]);

    const absenceDays = useMemo(() => {
        const days = new Map<string, { type: Absence['type'], status: Absence['status']}[]>();
        absences.forEach(absence => {
            if (!absence.startDate || !absence.endDate || !isValid(absence.startDate) || !isValid(absence.endDate) || absence.startDate > absence.endDate) return;

             const interval = eachDayOfInterval({ start: absence.startDate, end: absence.endDate });
             interval.forEach(day => {
                const dayString = day.toDateString();
                if (!days.has(dayString)) {
                    days.set(dayString, []);
                }
                days.get(dayString)?.push({ type: absence.type, status: absence.status });
            });
        });
        return days;
    }, [absences]);
    
    if (loading) {
        return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mi Calendario de Ausencias</CardTitle>
                <CardDescription>Consulta tus vacaciones, bajas y días festivos registrados.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                 <Calendar
                    mode="single"
                    className="rounded-md border p-4"
                    numberOfMonths={2}
                    components={{
                        DayContent: ({ date }) => {
                            const dayAbsences = absenceDays.get(date.toDateString());
                            const dayElement = (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <span>{date.getDate()}</span>
                                    {dayAbsences && dayAbsences.length > 0 && (
                                        <div className="absolute bottom-1 w-full flex justify-center gap-0.5">
                                            {dayAbsences.slice(0, 3).map((absence, index) => (
                                                <div key={index} className={`h-1.5 w-1.5 rounded-full ${getAbsenceTypeColor(absence.type)} ${absence.status === 'Pendiente' ? 'opacity-50' : ''}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );

                            if (dayAbsences && dayAbsences.length > 0) {
                                return (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div className="relative w-full h-full flex items-center justify-center cursor-pointer">{dayElement}</div>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-60">
                                            <div className="space-y-2">
                                                <p className="font-semibold text-sm">Ausencias del día:</p>
                                                {dayAbsences.map((absence, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <div className={`h-2 w-2 rounded-full ${getAbsenceTypeColor(absence.type)}`} />
                                                        <span className="text-sm">{absence.type} ({absence.status})</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )
                            }

                            return dayElement;
                        }
                    }}
                />
            </CardContent>
        </Card>
    );
}

