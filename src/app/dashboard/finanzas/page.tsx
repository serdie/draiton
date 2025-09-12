
'use client';

import { useState, useEffect, useContext } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Coins, Receipt, FileSignature, Loader2, MoreHorizontal, Download, Mail, Trash2, Pencil } from 'lucide-react';
import { DocumentosContent } from '../documentos/documentos-content';
import { GastosContent } from '../gastos/gastos-content';
import { ImpuestosTab } from './impuestos-tab';
import { AuthContext } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { NominasPageContent } from './nominas/nominas-page-content';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import type { GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ViewPayrollModal } from './nominas/view-payroll-modal';
import type { Employee } from './nominas/page';

export default function FinanzasPage() {
  const { user, isEmpresa, isEmployee } = useContext(AuthContext);
  const { toast } = useToast();
  const [payrolls, setPayrolls] = useState<(GeneratePayrollOutput & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [payrollToView, setPayrollToView] = useState<GeneratePayrollOutput | null>(null);

  useEffect(() => {
    if (isEmployee && user) {
        setLoading(true);
        const q = query(collection(db, 'payrolls'), where('employeeId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const payrollsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GeneratePayrollOutput & { id: string }));
            
            const monthOrder = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            payrollsList.sort((a, b) => {
                const [monthA, yearA] = a.header.period.split(' ');
                const [monthB, yearB] = b.header.period.split(' ');
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
  }, [isEmployee, user, toast]);

  if (isEmployee) {
    return (
        <>
        {payrollToView && user && (
             <ViewPayrollModal
                isOpen={!!payrollToView}
                onClose={() => setPayrollToView(null)}
                payroll={payrollToView}
                // Mock employee data for the modal, as the employee is the user.
                employee={{
                    id: user.uid,
                    name: user.displayName || 'Empleado',
                    email: user.email || '',
                    ownerId: '',
                    position: '',
                    nif: '',
                    socialSecurityNumber: '',
                    contractType: 'Indefinido',
                    grossAnnualSalary: 0,
                }}
            />
        )}
         <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Mis Nóminas</h1>
                <p className="text-muted-foreground">Consulta y descarga tus nóminas mensuales.</p>
            </div>
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
                                        <TableCell className="font-medium">{payroll.header.period}</TableCell>
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
        </div>
        </>
    )
  }

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión Financiera</h1>
          <p className="text-muted-foreground">Controla tus facturas, gastos e impuestos en un solo lugar.</p>
        </div>

        <Tabs defaultValue="documentos" className="w-full">
          <TabsList className={cn("grid w-full", isEmpresa ? "grid-cols-4" : "grid-cols-3")}>
            <TabsTrigger value="documentos"><FileText className="mr-2 h-4 w-4" />Documentos</TabsTrigger>
            <TabsTrigger value="gastos"><Receipt className="mr-2 h-4 w-4" />Gastos</TabsTrigger>
            <TabsTrigger value="impuestos"><Coins className="mr-2 h-4 w-4" />Impuestos</TabsTrigger>
            {isEmpresa && (
                 <TabsTrigger value="nominas"><FileSignature className="mr-2 h-4 w-4" />Nóminas</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="documentos" className="mt-6">
            <DocumentosContent />
          </TabsContent>
          <TabsContent value="gastos"  className="mt-6">
            <GastosContent />
          </TabsContent>
          <TabsContent value="impuestos"  className="mt-6">
            <ImpuestosTab />
          </TabsContent>
           {isEmpresa && (
                <TabsContent value="nominas"  className="mt-6">
                    <NominasPageContent />
                </TabsContent>
           )}
        </Tabs>
      </div>
  );
}
