
'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, MoreHorizontal, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { type GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import { ViewPayrollModal } from '../nominas/view-payroll-modal';

export function EmployeePayslipList() {
    const { toast } = useToast();
    const [payrolls, setPayrolls] = useState<(GeneratePayrollOutput & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [payrollToView, setPayrollToView] = useState<GeneratePayrollOutput | null>(null);
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (currentUser) {
            setLoading(true);
            const q = query(collection(db, 'payrolls'), where('employeeId', '==', currentUser.uid));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const payrollsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GeneratePayrollOutput & { id: string }));

                const monthOrder = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                payrollsList.sort((a, b) => {
                    if (!a.header?.paymentPeriod || !b.header?.paymentPeriod) return 0;
                    const [monthA, yearA] = a.header.paymentPeriod.split(' ');
                    const [monthB, yearB] = b.header.paymentPeriod.split(' ');
                    const dateA = new Date(parseInt(yearA), monthOrder.indexOf(monthA));
                    const dateB = new Date(parseInt(yearB), monthOrder.indexOf(monthB));
                    return dateB.getTime() - dateA.getTime();
                });

                setPayrolls(payrollsList);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching payrolls for employee:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar tus nóminas.' });
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, [currentUser, toast]);
    
     if (!currentUser) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Historial de Nóminas</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">Inicia sesión para ver tus nóminas.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            {payrollToView && (
                 <ViewPayrollModal
                    isOpen={!!payrollToView}
                    onClose={() => setPayrollToView(null)}
                    payroll={payrollToView}
                    employee={{
                        id: currentUser.uid,
                        name: currentUser.displayName || 'Empleado',
                        email: currentUser.email || '',
                        ownerId: '',
                        position: '',
                        nif: '',
                        socialSecurityNumber: '',
                        contractType: 'Indefinido',
                        grossAnnualSalary: 0,
                    }}
                />
            )}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Nóminas</CardTitle>
                    <CardDescription>Aquí puedes ver todas tus nóminas recibidas.</CardDescription>
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
                                {payrolls.length > 0 ? payrolls.map((payroll) => (
                                    <TableRow key={payroll.id}>
                                        <TableCell className="font-medium">{payroll.header?.paymentPeriod || 'No especificado'}</TableCell>
                                        <TableCell>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(payroll.netPay)}</TableCell>
                                        <TableCell className="text-green-600">Pagada</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setPayrollToView(payroll)}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Ver Nómina
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setPayrollToView(payroll)}>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Descargar PDF
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            Aún no has recibido ninguna nómina.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </>
    );
}
