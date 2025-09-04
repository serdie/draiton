
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileSignature, Download, Mail, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { GeneratePayrollModal } from '../generate-payroll-modal';
import type { Employee } from '../page';
import { useToast } from '@/hooks/use-toast';

// Mock data, in a real app this would come from a database
const initialEmployees: Employee[] = [
    { id: '1', name: 'Ana García', position: 'Desarrolladora Frontend', nif: '12345678A', socialSecurityNumber: '28/1234567890', contractType: 'Indefinido', grossAnnualSalary: 42000 },
    { id: '2', name: 'Carlos Martínez', position: 'Diseñador UX/UI', nif: '87654321B', socialSecurityNumber: '28/0987654321', contractType: 'Indefinido', grossAnnualSalary: 38000 },
    { id: '3', name: 'Laura Sánchez', position: 'Project Manager Jr.', nif: '45678912C', socialSecurityNumber: '28/1122334455', contractType: 'Temporal', grossAnnualSalary: 31000 },
];

const mockPayrolls = [
    { id: 'pay_1', period: 'Julio 2024', amount: 2450.75, status: 'Pagado' },
    { id: 'pay_2', period: 'Junio 2024', amount: 2450.75, status: 'Pagado' },
    { id: 'pay_3', period: 'Mayo 2024', amount: 2450.75, status: 'Pagado' },
];

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const employeeId = params.id as string;
    
    // In a real app, you would fetch the employee and their payrolls based on the ID
    const employee = initialEmployees.find(e => e.id === employeeId);
    
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

    if (!employee) {
        return (
            <div className="text-center">
                <p>Empleado no encontrado.</p>
                <Button onClick={() => router.push('/dashboard/finanzas/nominas')} className="mt-4">
                    Volver a Nóminas
                </Button>
            </div>
        );
    }
    
    const handleComingSoon = (action: string) => {
        toast({ title: 'Próximamente', description: `La acción de ${action} estará disponible pronto.` });
    };

    return (
        <>
            {isGenerateModalOpen && (
                 <GeneratePayrollModal
                    isOpen={isGenerateModalOpen}
                    onClose={() => setIsGenerateModalOpen(false)}
                    employee={employee}
                />
            )}
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/finanzas?tab=nominas')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">{employee.name}</h1>
                            <p className="text-muted-foreground">{employee.position}</p>
                        </div>
                    </div>
                    <Button onClick={() => setIsGenerateModalOpen(true)}>
                        <FileSignature className="mr-2 h-4 w-4" />
                        Generar Nueva Nómina
                    </Button>
                </div>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Empleado</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="font-semibold">NIF/NIE:</p><p className="text-muted-foreground">{employee.nif}</p></div>
                        <div><p className="font-semibold">Nº S.S.:</p><p className="text-muted-foreground">{employee.socialSecurityNumber}</p></div>
                        <div><p className="font-semibold">Tipo Contrato:</p><p className="text-muted-foreground">{employee.contractType}</p></div>
                        <div><p className="font-semibold">Salario Bruto:</p><p className="text-muted-foreground">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(employee.grossAnnualSalary)}/año</p></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Nóminas</CardTitle>
                        <CardDescription>Aquí se guardarán todas las nóminas generadas para este empleado.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Periodo</TableHead>
                                    <TableHead>Importe Líquido</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockPayrolls.map((payroll) => (
                                    <TableRow key={payroll.id}>
                                        <TableCell className="font-medium">{payroll.period}</TableCell>
                                        <TableCell>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(payroll.amount)}</TableCell>
                                        <TableCell className="text-green-600">{payroll.status}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleComingSoon('Ver Nómina')}>
                                                        <FileSignature className="mr-2 h-4 w-4" />
                                                        Ver Nómina
                                                    </DropdownMenuItem>
                                                     <DropdownMenuItem onClick={() => handleComingSoon('Descargar PDF')}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Descargar PDF
                                                    </DropdownMenuItem>
                                                     <DropdownMenuItem onClick={() => handleComingSoon('Enviar por Email')}>
                                                        <Mail className="mr-2 h-4 w-4" />
                                                        Enviar por Email
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
