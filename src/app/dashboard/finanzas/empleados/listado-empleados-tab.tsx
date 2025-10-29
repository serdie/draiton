
'use client';

import { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, FileSignature, User, Trash2, Loader2 } from 'lucide-react';
import { GeneratePayrollModal } from '../../finanzas/nominas/generate-payroll-modal';
import type { Employee } from '../empleados/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, onSnapshot, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';

interface ListadoEmpleadosTabProps {
    onEditEmployee: (employee: Employee) => void;
    employees: Employee[];
    loading: boolean;
}


export function ListadoEmpleadosTab({ onEditEmployee, employees, loading }: ListadoEmpleadosTabProps) {
    const [employeeToGeneratePayroll, setEmployeeToGeneratePayroll] = useState<Employee | null>(null);
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    const { user, isEmpresa } = useContext(AuthContext);

    const employeeLimit = 5;
    const canAddEmployee = isEmpresa ? employees.length < employeeLimit : user?.role === 'admin';


    const handleDeleteEmployee = async () => {
        if (!employeeToDelete) return;
        try {
            // Delete from 'employees' collection using the employee's ID (which is the user's UID)
            await deleteDoc(doc(db, "employees", employeeToDelete.id));

            // Also delete from 'users' collection
            await deleteDoc(doc(db, "users", employeeToDelete.id));
            
            toast({ title: 'Empleado Eliminado', description: `${employeeToDelete.name} ha sido eliminado de la lista.` });
        } catch(error) {
            console.error("Error al eliminar empleado:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el empleado.'});
        } finally {
            setEmployeeToDelete(null);
        }
    };

    const handleViewHistory = (employee: Employee) => {
        sessionStorage.setItem('selectedEmployee', JSON.stringify(employee));
        router.push(`/dashboard/finanzas/nominas/${employee.id}`);
    }

    return (
        <>
            {employeeToGeneratePayroll && (
                 <GeneratePayrollModal
                    isOpen={!!employeeToGeneratePayroll}
                    onClose={() => setEmployeeToGeneratePayroll(null)}
                    employee={employeeToGeneratePayroll}
                />
            )}
             <AlertDialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará a <strong>{employeeToDelete?.name}</strong> de la lista de empleados y su cuenta de usuario asociada. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteEmployee} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Empleados</CardTitle>
                        <CardDescription>Gestiona los empleados de tu empresa.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <div className="flex justify-center items-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
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
                                {employees.length > 0 ? (
                                    employees.map((employee) => (
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
                                                    <DropdownMenuItem onClick={() => onEditEmployee(employee)}>
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
                                ))
                                ) : (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            No has añadido ningún empleado todavía.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
