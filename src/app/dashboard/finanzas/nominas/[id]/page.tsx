
'use client';

import { useState, useEffect, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, FileSignature, Download, Mail, MoreHorizontal, Pencil, Trash2, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { GeneratePayrollModal } from '../generate-payroll-modal';
import type { Employee } from '../page';
import { useToast } from '@/hooks/use-toast';
import type { GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import { ViewPayrollModal } from '../view-payroll-modal';
import { EditPayrollModal } from '../edit-payroll-modal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { collection, query, where, onSnapshot, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { AuthContext } from '@/context/auth-context';

const initialEmployees: Employee[] = [
    { id: '1', name: 'Ana García', position: 'Desarrolladora Frontend', nif: '12345678A', socialSecurityNumber: '28/1234567890', contractType: 'Indefinido', grossAnnualSalary: 42000 },
    { id: '2', name: 'Carlos Martínez', position: 'Diseñador UX/UI', nif: '87654321B', socialSecurityNumber: '28/0987654321', contractType: 'Indefinido', grossAnnualSalary: 38000 },
    { id: '3', name: 'Laura Sánchez', position: 'Project Manager Jr.', nif: '45678912C', socialSecurityNumber: '28/1122334455', contractType: 'Temporal', grossAnnualSalary: 31000 },
];

export default function EmployeeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const employeeId = params.id as string;
    
    const employee = initialEmployees.find(e => e.id === employeeId);
    
    const [payrolls, setPayrolls] = useState<(GeneratePayrollOutput & { id: string, status: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [payrollToView, setPayrollToView] = useState<GeneratePayrollOutput | null>(null);
    const [payrollToEdit, setPayrollToEdit] = useState<(GeneratePayrollOutput & { id: string }) | null>(null);
    const [payrollToDelete, setPayrollToDelete] = useState<(GeneratePayrollOutput & { id: string }) | null>(null);

    useEffect(() => {
        if (!db || !user || !employeeId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'payrolls'),
            where('ownerId', '==', user.uid),
            where('employeeId', '==', employeeId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const payrollsList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data
                } as (GeneratePayrollOutput & { id: string; status: string });
            });
            // TODO: Sort payrolls by period date
            setPayrolls(payrollsList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching payrolls:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las nóminas.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, employeeId, toast]);

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

    const handleDownload = (payroll: GeneratePayrollOutput) => {
        setPayrollToView(payroll);
    }
    
    const handleDeletePayroll = async () => {
        if (!payrollToDelete) return;
        try {
            await deleteDoc(doc(db, "payrolls", payrollToDelete.id));
            toast({ title: "Nómina Eliminada", description: `La nómina de ${payrollToDelete.header.period} ha sido eliminada.`});
        } catch (error) {
            console.error("Error deleting payroll: ", error);
            toast({ variant: 'destructive', title: "Error", description: "No se pudo eliminar la nómina."})
        } finally {
            setPayrollToDelete(null);
        }
    }

    return (
        <>
            {isGenerateModalOpen && (
                 <GeneratePayrollModal
                    isOpen={isGenerateModalOpen}
                    onClose={() => setIsGenerateModalOpen(false)}
                    employee={employee}
                />
            )}
            {payrollToView && (
                <ViewPayrollModal
                    isOpen={!!payrollToView}
                    onClose={() => setPayrollToView(null)}
                    payroll={payrollToView}
                    employee={employee}
                />
            )}
            {payrollToEdit && (
                <EditPayrollModal
                    isOpen={!!payrollToEdit}
                    onClose={() => setPayrollToEdit(null)}
                    employee={employee}
                    payroll={payrollToEdit}
                />
            )}
             <AlertDialog open={!!payrollToDelete} onOpenChange={(open) => !open && setPayrollToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará la nómina de <strong>{payrollToDelete?.header.period}</strong>. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeletePayroll} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
                        {loading ? (
                             <div className="flex justify-center items-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
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
                                    {payrolls.map((payroll) => (
                                        <TableRow key={payroll.id}>
                                            <TableCell className="font-medium">{payroll.header.period}</TableCell>
                                            <TableCell>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(payroll.netPay)}</TableCell>
                                            <TableCell className="text-green-600">{payroll.status}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setPayrollToView(payroll)}>
                                                            <FileSignature className="mr-2 h-4 w-4" />
                                                            Ver Nómina
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setPayrollToEdit(payroll)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar Nómina
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDownload(payroll)}>
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Descargar PDF
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleComingSoon('Enviar por Email')}>
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Enviar por Email
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => setPayrollToDelete(payroll)} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {payrolls.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No hay nóminas generadas para este empleado.
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
