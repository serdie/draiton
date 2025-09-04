
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, FileSignature, User, Trash2 } from 'lucide-react';
import { AddEmployeeModal } from './add-employee-modal';
import { EditEmployeeModal } from './edit-employee-modal';
import { GeneratePayrollModal } from './generate-payroll-modal';
import type { Employee } from './page';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

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
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
    const router = useRouter();
    const { toast } = useToast();

    const handleAddEmployee = (newEmployee: Omit<Employee, 'id'>) => {
        setEmployees(prev => [...prev, { id: Date.now().toString(), ...newEmployee }]);
    };

    const handleUpdateEmployee = (updatedEmployee: Employee) => {
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
        toast({ title: "Empleado Actualizado", description: `Los datos de ${updatedEmployee.name} se han guardado.` });
    };

    const handleDeleteEmployee = () => {
        if (!employeeToDelete) return;
        setEmployees(prev => prev.filter(emp => emp.id !== employeeToDelete.id));
        toast({ title: 'Empleado Eliminado', description: `${employeeToDelete.name} ha sido eliminado de la lista.` });
        setEmployeeToDelete(null);
    };

    const handleViewHistory = (employee: Employee) => {
        // In a real app, you might just pass the ID, but for this mock data setup,
        // we'll pass the whole object via a client-side mechanism or query params.
        // For simplicity, we'll store it in sessionStorage before navigating.
        sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
        router.push(`/dashboard/finanzas/nominas/${employee.id}`);
    }

    return (
        <>
            <AddEmployeeModal
                isOpen={isAddEmployeeModalOpen}
                onClose={() => setIsAddEmployeeModalOpen(false)}
                onAddEmployee={handleAddEmployee}
            />
            {employeeToEdit && (
                <EditEmployeeModal
                    isOpen={!!employeeToEdit}
                    onClose={() => setEmployeeToEdit(null)}
                    employee={employeeToEdit}
                    onUpdateEmployee={handleUpdateEmployee}
                />
            )}
            {employeeToGeneratePayroll && (
                 <GeneratePayrollModal
                    isOpen={!!employeeToGeneratePayroll}
                    onClose={() => setEmployeeToGeneratePayroll(null)}
                    employee={employeeToGeneratePayroll}
                />
            )}
             <AlertDialog open={!!employeeToDelete} onOpenChange={setEmployeeToDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará a <strong>{employeeToDelete?.name}</strong> de la lista de empleados. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteEmployee} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


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
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEmployeeToGeneratePayroll(employee)}>
                                                        <FileSignature className="mr-2 h-4 w-4" />
                                                        Generar Nómina
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleViewHistory(employee)}>
                                                        <User className="mr-2 h-4 w-4" />
                                                        Ver Historial
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => setEmployeeToEdit(employee)}>
                                                        <User className="mr-2 h-4 w-4" />
                                                        Editar Empleado
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setEmployeeToDelete(employee)} className="text-destructive focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
