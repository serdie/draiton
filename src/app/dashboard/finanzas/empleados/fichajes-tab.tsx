
'use client';

import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { EmployeeClocksCalendar } from './employee-clocks-calendar';
import { type Fichaje, type Employee } from './types';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';
import { Loader2, AlertCircle } from 'lucide-react';
import { ViewFichajeModal } from '../../proyectos/view-fichaje-modal';

const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}


export function FichajesTab() {
    const { user } = useContext(AuthContext);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [fichajes, setFichajes] = useState<Fichaje[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [fichajeToView, setFichajeToView] = useState<Fichaje | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        setLoading(true);

        const employeesQuery = query(collection(db, 'employees'), where('ownerId', '==', user.uid));
        const unsubscribeEmployees = onSnapshot(employeesQuery, (snapshot) => {
            if (!isMounted) return;
            const fetchedEmployees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
            setEmployees(fetchedEmployees);
            if (!selectedEmployee && fetchedEmployees.length > 0) {
                setSelectedEmployee(fetchedEmployees[0]);
            }
        });
        
        const fichajesQuery = query(collection(db, 'fichajes'), where('ownerId', '==', user.uid), orderBy('timestamp', 'desc'));
        const unsubscribeFichajes = onSnapshot(fichajesQuery, (snapshot) => {
            if (!isMounted) return;
            const fetchedFichajes = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp.toDate(),
                    requestedTimestamp: data.requestedTimestamp ? data.requestedTimestamp.toDate() : undefined
                } as Fichaje;
            });
            setFichajes(fetchedFichajes);
            setLoading(false); // Set loading to false after both subscriptions are set up
        });

        return () => {
            isMounted = false;
            unsubscribeEmployees();
            unsubscribeFichajes();
        }

    }, [user, selectedEmployee]);

    if (loading) {
        return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    const employeeHasPendingRequests = (employeeId: string) => {
        return fichajes.some(f => f.employeeId === employeeId && f.requestStatus === 'pending');
    }

    return (
        <>
        {fichajeToView && (
            <ViewFichajeModal
                isOpen={!!fichajeToView}
                onClose={() => setFichajeToView(null)}
                fichaje={fichajeToView}
            />
        )}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Registro de Fichajes de Empleados</CardTitle>
                    <CardDescription>Selecciona un empleado para ver su calendario de control horario y gestionar solicitudes.</CardDescription>
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
                                 {employeeHasPendingRequests(employee.id) && (
                                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                                )}
                            </div>
                        )) : <p className="text-sm text-muted-foreground">No tienes empleados registrados.</p>}
                    </div>
                    <div className="md:col-span-3">
                       {selectedEmployee ? (
                            <EmployeeClocksCalendar 
                                employee={selectedEmployee}
                                fichajes={fichajes.filter(f => f.employeeId === selectedEmployee.id)}
                                onViewFichaje={setFichajeToView}
                            />
                       ) : (
                           <div className="flex items-center justify-center h-full text-muted-foreground">
                               <p>Selecciona un empleado para ver sus fichajes.</p>
                           </div>
                       )}
                    </div>
                </CardContent>
            </Card>
        </div>
        </>
    );
}
