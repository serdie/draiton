
'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip, LabelList } from 'recharts';
import { TrendingUp, Landmark, Percent, Scale, Loader2, FileText } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Document } from '../../documentos/page';
import type { Expense } from '../../gastos/page';
import { format, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { FinancialReportModal } from './financial-report-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Period = 'mensual' | 'trimestral' | 'anual';
type ReportType = 'p&g' | 'balance' | 'cashflow';

const chartConfig = {
  income: { label: 'Ingresos', color: 'hsl(var(--chart-2))' },
  expenses: { label: 'Gastos', color: 'hsl(var(--chart-5))' },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7300'];


export default function VisionGeneralFinanzasPage() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState<Period>('trimestral');
    
    // Financial states
    const [netProfit, setNetProfit] = useState(0);
    const [pendingInvoices, setPendingInvoices] = useState(0);
    const [taxIVA, setTaxIVA] = useState(0);
    const [taxIRPF, setTaxIRPF] = useState(0);

    // Chart states
    const [incomeVsExpensesData, setIncomeVsExpensesData] = useState<any[]>([]);
    
    // Report Modal State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);

     useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const now = new Date();
        let startDate: Date;
        let endDate: Date = endOfMonth(now);
        let chartMonths = 6;

        switch (periodo) {
            case 'mensual':
                startDate = startOfMonth(now);
                chartMonths = 1;
                break;
            case 'trimestral':
                startDate = startOfQuarter(now);
                endDate = endOfQuarter(now);
                chartMonths = 3;
                break;
            case 'anual':
                startDate = startOfYear(now);
                endDate = endOfYear(now);
                chartMonths = 12;
                break;
            default:
                startDate = startOfQuarter(now);
                endDate = endOfQuarter(now);
                chartMonths = 3;
                break;
        }

        const invoicesQuery = query(collection(db, 'invoices'), where('ownerId', '==', user.uid));
        const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
            const allInvoices = snapshot.docs.map(doc => ({...doc.data(), id: doc.id, fechaEmision: (doc.data().fechaEmision as Timestamp).toDate()}) as Document & { id: string });
            
            const periodInvoices = allInvoices.filter(inv => inv.fechaEmision >= startDate && inv.fechaEmision <= endDate);
            
            const totalPaidInPeriod = periodInvoices.filter(i => i.estado === 'Pagado').reduce((sum, i) => sum + i.subtotal, 0);
            
            const totalPending = allInvoices.filter(i => i.estado === 'Pendiente' || i.estado === 'Enviado' || i.estado === 'Emitido').reduce((sum, i) => sum + i.importe, 0);
            setPendingInvoices(totalPending);

            const ivaDevengado = periodInvoices.reduce((sum, i) => sum + i.impuestos, 0);

            const expensesQuery = query(collection(db, 'expenses'), where('ownerId', '==', user.uid));
            const unsubscribeExpenses = onSnapshot(expensesQuery, (expensesSnapshot) => {
                const allExpenses = expensesSnapshot.docs.map(doc => ({...doc.data(), id: doc.id, fecha: (doc.data().fecha as Timestamp).toDate()}) as Expense & { id: string });

                const periodExpenses = allExpenses.filter(exp => exp.fecha >= startDate && exp.fecha <= endDate);
                const totalExpensesInPeriod = periodExpenses.reduce((sum, exp) => sum + exp.importe, 0);
                
                const calculatedNetProfit = totalPaidInPeriod - totalExpensesInPeriod;
                setNetProfit(calculatedNetProfit);

                const baseIRPF = calculatedNetProfit > 0 ? calculatedNetProfit : 0;
                setTaxIRPF(baseIRPF * 0.20); 

                const ivaSoportado = periodExpenses.reduce((sum, i) => sum + (i.importe * 0.21 / 1.21), 0);
                setTaxIVA(ivaDevengado - ivaSoportado);

                const chartStartDate = startOfMonth(subMonths(now, chartMonths - 1));
                const chartEndDate = endOfMonth(now);
                const monthsInterval = eachMonthOfInterval({ start: chartStartDate, end: chartEndDate });
                const monthlyData = monthsInterval.map(monthStart => ({
                    month: format(monthStart, 'MMM', { locale: es }),
                    income: 0,
                    expenses: 0,
                }));

                allInvoices.forEach(inv => {
                    if (inv.fechaEmision >= chartStartDate && inv.fechaEmision <= chartEndDate && inv.estado === 'Pagado') {
                        const monthStr = format(inv.fechaEmision, 'MMM', { locale: es });
                        const monthData = monthlyData.find(m => m.month === monthStr);
                        if(monthData) monthData.income += inv.subtotal;
                    }
                });
                allExpenses.forEach(exp => {
                    if (exp.fecha >= chartStartDate && exp.fecha <= chartEndDate) {
                         const monthStr = format(exp.fecha, 'MMM', { locale: es });
                        const monthData = monthlyData.find(m => m.month === monthStr);
                        if(monthData) monthData.expenses += exp.importe;
                    }
                });

                setIncomeVsExpensesData(monthlyData as any);
                setLoading(false);
            });

            return () => unsubscribeExpenses();
        });

        return () => unsubscribeInvoices();

    }, [user, periodo]);

    const handleOpenReport = (reportType: ReportType) => {
        setSelectedReport(reportType);
        setIsReportModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <>
     <FinancialReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType={selectedReport}
      />
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold">Visión General Financiera</h1>
            <p className="text-muted-foreground">
                Tu centro de mando para la salud económica de tu negocio.
            </p>
        </div>
        <Select value={periodo} onValueChange={(value) => setPeriodo(value as Period)}>
            <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Seleccionar Periodo" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="mensual">Este Mes</SelectItem>
                <SelectItem value="trimestral">Este Trimestre</SelectItem>
                <SelectItem value="anual">Este Año</SelectItem>
            </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Beneficio Neto ({periodo.charAt(0).toUpperCase() + periodo.slice(1)})</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{netProfit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                <p className="text-xs text-muted-foreground">Ingresos (Pagado) - Gastos</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{pendingInvoices.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                <p className="text-xs text-muted-foreground">Total por cobrar (todas)</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Previsión IVA ({periodo.charAt(0).toUpperCase() + periodo.slice(1)})</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{taxIVA.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                <p className="text-xs text-muted-foreground">Estimación a pagar (Modelo 303)</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Previsión IRPF ({periodo.charAt(0).toUpperCase() + periodo.slice(1)})</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{taxIRPF.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                <p className="text-xs text-muted-foreground">Estimación a pagar (Modelo 130)</p>
            </CardContent>
        </Card>
      </div>

       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
            <CardHeader>
                <CardTitle>Ingresos vs. Gastos</CardTitle>
                <CardDescription>Evolución de los últimos meses.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={incomeVsExpensesData} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickFormatter={(value) => `${value/1000}k`}/>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Informes Financieros</CardTitle>
            <CardDescription>Genera informes contables clave para tu negocio.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button variant="outline" className="justify-start" onClick={() => handleOpenReport('p&g')}>
              <FileText className="mr-2 h-4 w-4" />
              Pérdidas y Ganancias
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => handleOpenReport('balance')}>
              <FileText className="mr-2 h-4 w-4" />
              Balance de Situación
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => handleOpenReport('cashflow')}>
              <FileText className="mr-2 h-4 w-4" />
              Flujo de Caja
            </Button>
          </CardContent>
        </Card>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Previsión de Flujo de Caja (Cash Flow)</CardTitle>
            <CardDescription>Estimación de la salud financiera de tu negocio para los próximos 3 meses basada en datos actuales.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Esta funcionalidad está en desarrollo y pronto te ofrecerá una visión clara de tu futuro financiero.</p>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
