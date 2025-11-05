
'use client';

import { useState, useContext, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, PlusCircle, CalendarOff, FilterX, ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import type { Employee, Absence, AbsenceType, AbsenceStatus } from './types';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RegisterAbsenceModal } from './register-absence-modal';
import { eachDayOfInterval } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

const getAbsenceBadgeClass = (status: AbsenceStatus) => {
  switch (status) {
    case 'Aprobada': return 'bg-green-100 text-green-800 border-green-200';
    case 'Pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Rechazada': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const absenceTypes: AbsenceType[] = ['Vacaciones', 'Baja por enfermedad', 'Paternidad/Maternidad', 'Día propio', 'Otro'];
const absenceStatuses: AbsenceStatus[] = ['Aprobada', 'Pendiente', 'Rechazada'];


export function AusenciasTab() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [absenceToDelete, setAbsenceToDelete] = useState<Absence | null>(null);

    // Filtering and pagination for history table
    const [filtroEmpleado, setFiltroEmpleado] = useState('all');
    const [filtroTipo, setFiltroTipo] = useState('all');
    const [filtroEstado, setFiltroEstado] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        setLoading(true);

        const employeesQuery = query(collection(db, 'employees'), where('ownerId', '==', user.uid));
        const absencesQuery = query(collection(db, 'absences'), where('ownerId', '==', user.uid), orderBy('startDate', 'desc'));

        const initialLoad = async () => {
            try {
                await Promise.all([getDocs(employeesQuery), getDocs(absencesQuery)]);
                if (isMounted) setLoading(false);
            } catch (error) {
                console.error("Error during initial data load:", error);
                if (isMounted) setLoading(false);
            }
        };

        initialLoad();
        
        const unsubscribeEmployees = onSnapshot(employeesQuery, (snapshot) => {
            if (!isMounted) return;
            const fetchedEmployees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
            setEmployees(fetchedEmployees);
            if (!selectedEmployee && fetchedEmployees.length > 0) {
                setSelectedEmployee(fetchedEmployees[0]);
            }
        }, (error) => {
             console.error("Error fetching employees:", error);
        });
        
        const unsubscribeAbsences = onSnapshot(absencesQuery, (snapshot) => {
            if (!isMounted) return;
            const fetchedAbsences = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
                    endDate: data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
                } as Absence;
            });
            setAbsences(fetchedAbsences);
        }, (error) => {
             console.error("Error fetching absences:", error);
        });


        return () => {
            isMounted = false;
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
            if (!absence.startDate || !absence.endDate) return;
            const interval = eachDayOfInterval({ start: new Date(absence.startDate), end: new Date(absence.endDate) });
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

    // History Table Logic
    const filteredAbsences = useMemo(() => {
        return absences.filter(absence => {
            const byEmployee = filtroEmpleado === 'all' || absence.employeeId === filtroEmpleado;
            const byType = filtroTipo === 'all' || absence.type === filtroTipo;
            const byStatus = filtroEstado === 'all' || absence.status === filtroEstado;
            return byEmployee && byType && byStatus;
        });
    }, [absences, filtroEmpleado, filtroTipo, filtroEstado]);
    
    const totalPages = Math.ceil(filteredAbsences.length / itemsPerPage);
    const paginatedAbsences = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAbsences.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAbsences, currentPage, itemsPerPage]);

    const resetFilters = () => {
        setFiltroEmpleado('all');
        setFiltroTipo('all');
        setFiltroEstado('all');
        setCurrentPage(1);
    };

    const handleDeleteAbsence = async () => {
        if (!absenceToDelete) return;
        try {
            await deleteDoc(doc(db, 'absences', absenceToDelete.id));
            toast({ title: 'Ausencia Eliminada', description: 'El registro de ausencia ha sido eliminado.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la ausencia.' });
            console.error("Error deleting absence: ", error);
        } finally {
            setAbsenceToDelete(null);
        }
    }

    if (loading) {
        return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    const employeeMap = new Map(employees.map(e => [e.id, e.name]));

    return (
        <>
            <RegisterAbsenceModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employees={employees}
            />
             <AlertDialog open={!!absenceToDelete} onOpenChange={(open) => !open && setAbsenceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>Esta acción eliminará permanentemente el registro de ausencia. No se puede deshacer.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAbsence} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="space-y-6">
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
                                                            <div className="relative w-full h-full flex items-center justify-center">{dayElement}</div>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Ausencias</CardTitle>
                        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <Select value={filtroEmpleado} onValueChange={setFiltroEmpleado}>
                                <SelectTrigger><SelectValue placeholder="Filtrar por empleado..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los empleados</SelectItem>
                                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                                <SelectTrigger><SelectValue placeholder="Filtrar por tipo..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los tipos</SelectItem>
                                    {absenceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                                <SelectTrigger><SelectValue placeholder="Filtrar por estado..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                     {absenceStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={resetFilters}><FilterX className="mr-2 h-4 w-4"/> Limpiar</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Empleado</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Periodo</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedAbsences.length > 0 ? paginatedAbsences.map(absence => (
                                    <TableRow key={absence.id}>
                                        <TableCell className="font-medium">{employeeMap.get(absence.employeeId) || 'Desconocido'}</TableCell>
                                        <TableCell>{absence.type}</TableCell>
                                        <TableCell>{format(new Date(absence.startDate), 'dd/MM/yy')} - {format(new Date(absence.endDate), 'dd/MM/yy')}</TableCell>
                                        <TableCell><Badge variant="outline" className={cn(getAbsenceBadgeClass(absence.status))}>{absence.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            {/* Actions Dropdown */}
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAbsenceToDelete(absence)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24">No hay ausencias para mostrar.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                     <CardFooter className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Mostrando {paginatedAbsences.length} de {filteredAbsences.length} ausencias.
                        </div>
                        <div className="flex items-center gap-2">
                             <Button
                                variant="outline" size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                            </Button>
                            <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages > 0 ? totalPages : 1}</span>
                            <Button
                                variant="outline" size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                            >
                                Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
