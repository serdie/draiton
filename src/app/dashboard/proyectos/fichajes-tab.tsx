'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { EmployeeClocksCalendar } from './employee-clocks-calendar';
import { Fichaje } from './types';

const employees = [
    { id: '1', name: 'Ana García', avatar: 'https://i.pravatar.cc/150?u=ana' },
    { id: '2', name: 'Carlos Martínez', avatar: 'https://i.pravatar.cc/150?u=carlos' },
    { id: '3', name: 'Laura Sánchez', avatar: 'https://i.pravatar.cc/150?u=laura' },
];

// ======================================================
// AQUÍ ESTÁ EL ARREGLO
// Se ha añadido "ownerId: 'ID_EMPRESA_PRUEBA'" a cada objeto
// ======================================================
const initialFichajes: Fichaje[] = [
    { id: '1', employeeId: '1', employeeName: 'Ana García', ownerId: 'ID_EMPRESA_PRUEBA', type: 'Entrada', timestamp: new Date(new Date().setHours(9, 2, 15)) },
    { id: '2', employeeId: '2', employeeName: 'Carlos Martínez', ownerId: 'ID_EMPRESA_PRUEBA', type: 'Entrada', timestamp: new Date(new Date().setHours(9, 5, 30)) },
    { id: '3', employeeId: '3', employeeName: 'Laura Sánchez', ownerId: 'ID_EMPRESA_PRUEBA', type: 'Entrada', timestamp: new Date(new Date().setHours(8, 58, 45)) },
    { id: '4', employeeId: '1', employeeName: 'Ana García', ownerId: 'ID_EMPRESA_PRUEBA', type: 'Salida', timestamp: new Date(new Date().setHours(17, 3, 20)) },
    { id: '5', employeeId: '2', employeeName: 'Carlos Martínez', ownerId: 'ID_EMPRESA_PRUEBA', type: 'Salida', timestamp: new Date(new Date().setHours(17, 35, 10)) },
    { id: '6', employeeId: '3', employeeName: 'Laura Sánchez', ownerId: 'ID_EMPRESA_PRUEBA', type: 'Salida', timestamp: new Date(new Date().setHours(18, 1, 5)) },
    // Add more data for different days
    { id: '7', employeeId: '1', employeeName: 'Ana García', ownerId: 'ID_EMPRESA_PRUEBA', type: 'Entrada', timestamp: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(9, 0, 0)) },
    { id: '8', employeeId: '1', employeeName: 'Ana García', ownerId: 'ID_EMPRESA_PRUEBA', type: 'Salida', timestamp: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(17, 30, 0)) },
    { id: '9', employeeId: '2', employeeName: 'Carlos Martínez', ownerId: 'ID_EMPRESA_PRUEBA', type: 'Entrada', timestamp: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(9, 15, 0)) },
    { id: '10', employeeId: '2', employeeName: 'Carlos Martínez', ownerId: 'ID_EMPRESA_PRUEBA', type: 'Salida', timestamp: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(17, 45, 0)) },
];
// ======================================================
// FIN DEL ARREGLO
// ======================================================

const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}


export function FichajesTab() {
    const [selectedEmployee, setSelectedEmployee] = useState(employees[0]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registro de Fichajes</CardTitle>
                <CardDescription>Selecciona un empleado para ver su calendario de fichajes.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-2">
                      <h3 className="font-semibold">Empleados</h3>
                    {employees.map(employee => (
                        <div
                            key={employee.id}
                            onClick={() => setSelectedEmployee(employee)}
                            className={cn(
                                'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                                selectedEmployee.id === employee.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                            )}
                        >
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={employee.avatar} alt={employee.name} />
                                <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{employee.name}</span>
                        </div>
                    ))}
                </div>
                <div className="md:col-span-3">
                   {selectedEmployee && (
                        <EmployeeClocksCalendar 
                            employee={selectedEmployee}
                            fichajes={initialFichajes.filter(f => f.employeeId === selectedEmployee.id)}
                        />
                   )}
                </div>
            </CardContent>
        </Card>
    );
}