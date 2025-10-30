
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { collection, query, where, onSnapshot, Timestamp, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { type Employee } from '@/app/dashboard/finanzas/empleados/types';
import { type GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowLeft, FileText, MoreHorizontal, Download, Trash2, Pencil } from 'lucide-react';
import Link from 'next/link';
import { ViewPayrollModal } from '../view-payroll-modal';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EditPayrollModal } from '../edit-payroll-modal';

export default function EmployeePayrollHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [payrolls, setPayrolls] = useState<(GeneratePayrollOutput & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [payrollToView, setPayrollToView] = useState<GeneratePayrollOutput | null>(null);
  const [payrollToEdit, setPayrollToEdit] = useState<(GeneratePayrollOutput & { id: string }) | null>(null);
  const [payrollToDelete, setPayrollToDelete] = useState<(GeneratePayrollOutput & { id: string }) | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Retrieve employee data from sessionStorage safely
    if (typeof window !== 'undefined') {
        const storedEmployee = sessionStorage.getItem('selectedEmployee');
        if (storedEmployee) {
          const parsedEmployee = JSON.parse(storedEmployee);
          if(parsedEmployee.id === employeeId) {
            setEmployee(parsedEmployee);
          }
        }
    }
    
    if (!employeeId) {
      router.push('/dashboard/finanzas?tab=empleados');
      return;
    }

    const payrollsQuery = query(collection(db, 'payrolls'), where('employeeId', '==', employeeId));
    const unsubscribe = onSnapshot(payrollsQuery, (snapshot) => {
      const payrollsList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as GeneratePayrollOutput & { id: string }))
        .filter(payroll => payroll.header); // Ensure basic structure exists
      
       const monthOrder = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        payrollsList.sort((a, b) => {
            const [monthAStr, yearAStr] = (a.header?.paymentPeriod || '').split(' ');
            const [monthBStr, yearBStr] = (b.header?.paymentPeriod || '').split(' ');
            
            const monthA = monthOrder.indexOf(monthAStr);
            const yearA = parseInt(yearAStr);
            const monthB = monthOrder.indexOf(monthBStr);
            const yearB = parseInt(yearBStr);

            if (isNaN(yearA) || isNaN(yearB) || monthA < 0 || monthB < 0) return 0;

            const dateA = new Date(yearA, monthA);
            const dateB = new Date(yearB, monthB);
            
            return dateB.getTime() - dateA.getTime();
        });

      setPayrolls(payrollsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching payroll history:", error);
      toast({
        variant: 'destructive',
        title: 'Error al cargar el historial',
        description: 'No se pudieron cargar las nóminas para este empleado.',
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [employeeId, router, toast]);

  const handleDeletePayroll = async () => {
    if (!payrollToDelete) return;
    try {
        await deleteDoc(doc(db, "payrolls", payrollToDelete.id));
        toast({ title: 'Nómina Eliminada', description: `La nómina para ${payrollToDelete.header.paymentPeriod} ha sido eliminada.` });
    } catch (error) {
        console.error("Error al eliminar la nómina:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la nómina.' });
    } finally {
        setPayrollToDelete(null);
    }
  }

  const handleSaveEditedPayroll = (updatedPayroll: GeneratePayrollOutput) => {
    // This function can be used to update the local state if needed,
    // but onSnapshot should handle it automatically.
    // For now, we just close the modal.
    setPayrollToEdit(null);
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!employee) {
    return (
        <div className="text-center">
            <p>No se pudo cargar la información del empleado.</p>
             <Button onClick={() => router.push('/dashboard/finanzas?tab=empleados')} className="mt-4">
                Volver a Empleados
             </Button>
        </div>
    )
  }

  return (
    <>
      {payrollToView && employee && (
        <ViewPayrollModal
          isOpen={!!payrollToView}
          onClose={() => setPayrollToView(null)}
          payroll={payrollToView}
          employee={employee}
        />
      )}
      {payrollToEdit && employee && (
        <EditPayrollModal
          isOpen={!!payrollToEdit}
          onClose={() => setPayrollToEdit(null)}
          payroll={payrollToEdit}
          onSave={handleSaveEditedPayroll}
        />
      )}
      <AlertDialog open={!!payrollToDelete} onOpenChange={(open) => !open && setPayrollToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción eliminará la nómina de <strong>{payrollToDelete?.header.paymentPeriod}</strong> para {employee.name}. Esta acción no se puede deshacer.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePayroll} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/finanzas?tab=empleados">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Historial de Nóminas</h1>
            <p className="text-muted-foreground">Viendo las nóminas generadas para {employee.name}.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nóminas</CardTitle>
            <CardDescription>Lista de todas las nóminas guardadas para este empleado.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Total Devengado</TableHead>
                  <TableHead>Total Deducciones</TableHead>
                  <TableHead>Líquido a Percibir</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrolls.length > 0 ? (
                  payrolls.map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">{payroll.header?.paymentPeriod || 'Periodo no especificado'}</TableCell>
                      <TableCell>{(payroll.summary?.totalAccruals ?? 0).toFixed(2)}€</TableCell>
                      <TableCell>{(payroll.summary?.totalDeductions ?? 0).toFixed(2)}€</TableCell>
                      <TableCell className="font-semibold">{(payroll.netPay ?? 0).toFixed(2)}€</TableCell>
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
                                <DropdownMenuItem onClick={() => setPayrollToEdit(payroll)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setPayrollToDelete(payroll)} className="text-destructive focus:text-destructive">
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
                    <TableCell colSpan={5} className="h-24 text-center">
                      No hay nóminas generadas para este empleado.
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
