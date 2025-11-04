
'use client';

import { useState, useContext, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, PlusCircle, CalendarOff } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Employee, Absence } from './types';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RegisterAbsenceModal } from './register-absence-modal';
import { eachDayOfInterval, isWithinInterval } from 'date-fns';

const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const getAbsenceTypeColor = (type: Absence['type']) => {
    switch (type) {
        case 'Vacaciones': return 'bg-blue-500';
        case 'Baja por enfermedad': return 'bg-orange-500';
        case 'Paternidad/Maternidad': return 'bg-purple-500';
        case 'Día propio': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
};

export function AusenciasTab() {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const employeesQuery = query(collection(db, 'employees'), where('ownerId', '==', user.uid));
        const unsubscribeEmployees = onSnapshot(employeesQuery, (snapshot) => {
            const fetchedEmployees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
            setEmployees(fetchedEmployees);
            if (!selectedEmployee && fetchedEmployees.length > 0) {
                setSelectedEmployee(fetchedEmployees[0]);
            }
             if (fetchedEmployees.length === 0) {
                setLoading(false);
            }
        });
        
        const absencesQuery = query(collection(db, 'absences'), where('ownerId', '==', user.uid));
        const unsubscribeAbsences = onSnapshot(absencesQuery, (snapshot) => {
            const fetchedAbsences = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate.toDate(),
                    endDate: data.endDate.toDate(),
                } as Absence;
            });
            setAbsences(fetchedAbsences);
            setLoading(false);
        });

        return () => {
            unsubscribeEmployees();
            unsubscribeAbsences();
        }
    }, [user, selectedEmployee]);

    const employeeAbsences = useMemo(() => {
        if (!selectedEmployee) return [];
        return absences.filter(a => a.employeeId === selectedEmployee.id);
    }, [absences, selectedEmployee]);

    const absenceDays = useMemo(() => {
        const days = new Map<string, { type: Absence['type'], status: Absence['status']}[]>();
        employeeAbsences.forEach(absence => {
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
    }, [employeeAbsences]);

    if (loading) {
        return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    return (
        <>
            <RegisterAbsenceModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employees={employees}
            />
            <Card>
                <CardHeader className="flex flex-row justify-between items-start">
                    <div>
                        <CardTitle>Calendario de Ausencias</CardTitle>
                        <CardDescription>Gestiona las vacaciones, bajas y otros días libres de tus empleados.</CardDescription>
                    </div>
                     <Button onClick={() => setIsModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Registrar Ausencia
                    </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 space-y-2">
                        <h3 className="font-semibold">Empleados</h3>
                        {employees.length > 0 ? employees.map(employee => (
                            <div
                                key={employee.id}
                                onClick={() => setSelectedEmployee(employee)}
                                className={cn(
                                    'flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                                    selectedEmployee?.id === employee.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={(employee as any).avatar} alt={employee.name} />
                                        <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{employee.name}</span>
                                </div>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">No tienes empleados registrados.</p>}
                    </div>
                    <div className="md:col-span-3">
                        {selectedEmployee ? (
                            <Calendar
                                mode="single"
                                className="rounded-md border p-4"
                                numberOfMonths={2}
                                components={{
                                    DayContent: ({ date, ...props }) => {
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
                                                        {dayElement}
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
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground border rounded-md p-8 text-center">
                                <CalendarOff className="h-12 w-12 mb-4"/>
                                <p>Selecciona un empleado para ver su calendario de ausencias.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
