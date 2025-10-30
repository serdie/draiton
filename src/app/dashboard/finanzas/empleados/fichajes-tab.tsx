
'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { EmployeeClocksCalendar } from './employee-clocks-calendar';
import { type Fichaje, type Employee } from './types';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

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

    useEffect(() => {
        if (!user) return;

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
        
        const fichajesQuery = query(collection(db, 'fichajes'), where('ownerId', '==', user.uid));
        const unsubscribeFichajes = onSnapshot(fichajesQuery, (snapshot) => {
            const fetchedFichajes = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp.toDate()
                } as Fichaje;
            });
            setFichajes(fetchedFichajes);
            setLoading(false);
        });

        return () => {
            unsubscribeEmployees();
            unsubscribeFichajes();
        }

    }, [user, selectedEmployee]);

    if (loading) {
        return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registro de Fichajes de Empleados</CardTitle>
                <CardDescription>Selecciona un empleado para ver su calendario de control horario.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                     <h3 className="font-semibold">Empleados</h3>
                    {employees.length > 0 ? employees.map(employee => (
                        <div
                            key={employee.id}
                            onClick={() => setSelectedEmployee(employee)}
                            className={cn(
                                'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                                selectedEmployee?.id === employee.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                            )}
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={(employee as any).avatar} alt={employee.name} />
                                <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{employee.name}</span>
                        </div>
                    )) : <p className="text-sm text-muted-foreground">No tienes empleados registrados.</p>}
                </div>
                <div className="md:col-span-3">
                   {selectedEmployee ? (
                        <EmployeeClocksCalendar 
                            employee={selectedEmployee}
                            fichajes={fichajes.filter(f => f.employeeId === selectedEmployee.id)}
                        />
                   ) : (
                       <div className="flex items-center justify-center h-full text-muted-foreground">
                           <p>Selecciona un empleado para ver sus fichajes.</p>
                       </div>
                   )}
                </div>
            </CardContent>
        </Card>
    );
}
