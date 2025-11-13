
'use client';

import { useState, useContext, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { AuthContext } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import type { Absence, AbsenceStatus } from '../finanzas/empleados/types';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { eachDayOfInterval, isValid, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RequestAbsenceModal } from './request-absence-modal';


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

const getAbsenceBadgeClass = (status: AbsenceStatus) => {
  switch (status) {
    case 'Aprobada': return 'bg-green-100 text-green-800 border-green-200';
    case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Rechazada': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function EmployeeAbsenceCalendar() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const itemsPerPage = 5;
    
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
    
    const totalPages = Math.ceil(absences.length / itemsPerPage);
    const paginatedAbsences = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return absences.slice(startIndex, startIndex + itemsPerPage);
    }, [absences, currentPage, itemsPerPage]);


    if (loading) {
        return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    return (
        <>
            <RequestAbsenceModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
            />
            <div className="space-y-6">
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <CardTitle>Mi Calendario de Ausencias</CardTitle>
                            <CardDescription>Consulta tus vacaciones, bajas y días festivos registrados.</CardDescription>
                        </div>
                        <Button onClick={() => setIsRequestModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Solicitar Ausencia
                        </Button>
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
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Ausencias</CardTitle>
                        <CardDescription>Revisa el estado de todas tus solicitudes de ausencia.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Periodo</TableHead>
                                    <TableHead>Notas</TableHead>
                                    <TableHead className="text-right">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedAbsences.length > 0 ? paginatedAbsences.map(absence => (
                                    <TableRow key={absence.id}>
                                        <TableCell className="font-medium">{absence.type}</TableCell>
                                        <TableCell>{format(absence.startDate, 'dd/MM/yy')} - {format(absence.endDate, 'dd/MM/yy')}</TableCell>
                                        <TableCell className="text-muted-foreground truncate max-w-xs">{absence.notes || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className={cn(getAbsenceBadgeClass(absence.status))}>
                                                {absence.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">No tienes ausencias registradas.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    {totalPages > 1 && (
                        <CardFooter className="flex justify-end items-center gap-4 text-sm">
                            <span>Página {currentPage} de {totalPages}</span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                                </Button>
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                >
                                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>
        </>
    );
}
