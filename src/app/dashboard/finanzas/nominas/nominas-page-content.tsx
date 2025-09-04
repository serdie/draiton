
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { AddEmployeeModal } from './add-employee-modal';
import { GeneratePayrollModal } from './generate-payroll-modal';
import type { Employee } from './page';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const initialEmployees: Employee[] = [
    {
        id: '1',
        name: 'Ana García',
        position: 'Desarrolladora Frontend',
        nif: '12345678A',
        socialSecurityNumber: '28/1234567890',
        contractType: 'Indefinido',
        grossAnnualSalary: 42000
    },
    {
        id: '2',
        name: 'Carlos Martínez',
        position: 'Diseñador UX/UI',
        nif: '87654321B',
        socialSecurityNumber: '28/0987654321',
        contractType: 'Indefinido',
        grossAnnualSalary: 38000
    },
    {
        id: '3',
        name: 'Laura Sánchez',
        position: 'Project Manager Jr.',
        nif: '45678912C',
        socialSecurityNumber: '28/1122334455',
        contractType: 'Temporal',
        grossAnnualSalary: 31000
    },
];

export function NominasPageContent() {
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [employeeToGeneratePayroll, setEmployeeToGeneratePayroll] = useState<Employee | null>(null);
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

    const handleAddEmployee = (newEmployee: Omit<Employee, 'id'>) => {
        setEmployees(prev => [...prev, { id: Date.now().toString(), ...newEmployee }]);
    };

    return (
        <>
            <AddEmployeeModal
                isOpen={isAddEmployeeModalOpen}
                onClose={() => setIsAddEmployeeModalOpen(false)}
                onAddEmployee={handleAddEmployee}
            />
            {employeeToGeneratePayroll && (
                 <GeneratePayrollModal
                    isOpen={!!employeeToGeneratePayroll}
                    onClose={() => setEmployeeToGeneratePayroll(null)}
                    employee={employeeToGeneratePayroll}
                />
            )}

            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Gestión de Empleados y Nóminas</h2>
                        <p className="text-muted-foreground">
                            Añade a tus empleados y genera sus nóminas con la ayuda de la IA.
                        </p>
                    </div>
                    <Button onClick={() => setIsAddEmployeeModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Empleado
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Empleados</CardTitle>
                        <CardDescription>Gestiona los empleados de tu empresa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Puesto</TableHead>
                                    <TableHead>Salario Bruto Anual</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell className="font-medium">{employee.name}</TableCell>
                                        <TableCell>{employee.position}</TableCell>
                                        <TableCell>
                                            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(employee.grossAnnualSalary)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => setEmployeeToGeneratePayroll(employee)}>
                                                Generar Nómina
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {employees.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No has añadido ningún empleado todavía.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
