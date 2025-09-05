
'use client';

import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip, LabelList } from 'recharts';
import { TrendingUp, TrendingDown, Landmark, Percent, Scale, Loader2 } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Document } from '../../documentos/page';
import type { Expense } from '../../gastos/page';
import { format, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns';
import { es } from 'date-fns/locale';

const chartConfig = {
  income: { label: 'Ingresos', color: 'hsl(var(--chart-2))' },
  expenses: { label: 'Gastos', color: 'hsl(var(--chart-5))' },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7300'];

export default function VisionGeneralFinanzasPage() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    
    // Financial states
    const [netProfit, setNetProfit] = useState(0);
    const [pendingInvoices, setPendingInvoices] = useState(0);
    const [taxIVA, setTaxIVA] = useState(0);
    const [taxIRPF, setTaxIRPF] = useState(0);

    // Chart states
    const [incomeVsExpensesData, setIncomeVsExpensesData] = useState([]);
    const [expenseCategoriesData, setExpenseCategoriesData] = useState<any[]>([]);

     useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const now = new Date();
        const startOfCurrentQuarter = startOfQuarter(now);
        const endOfCurrentQuarter = endOfQuarter(now);

        // --- Invoices listener ---
        const invoicesQuery = query(collection(db, 'invoices'), where('ownerId', '==', user.uid));
        const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
            const allInvoices = snapshot.docs.map(doc => ({...doc.data(), fechaEmision: (doc.data().fechaEmision as Timestamp).toDate()}) as Document);

            // Filter for current quarter
            const quarterInvoices = allInvoices.filter(inv => inv.fechaEmision >= startOfCurrentQuarter && inv.fechaEmision <= endOfCurrentQuarter);
            
            // Cards calculation
            const totalPaidInQuarter = quarterInvoices.filter(i => i.estado === 'Pagado').reduce((sum, i) => sum + i.subtotal, 0);
            const totalPending = allInvoices.filter(i => i.estado === 'Pendiente' || i.estado === 'Enviado').reduce((sum, i) => sum + i.importe, 0);
            setPendingInvoices(totalPending);

            const ivaDevengado = quarterInvoices.reduce((sum, i) => sum + i.impuestos, 0);
            setTaxIVA(ivaDevengado);
            
            // --- Expenses listener (nested to calculate net profit) ---
            const expensesQuery = query(collection(db, 'expenses'), where('ownerId', '==', user.uid));
            const unsubscribeExpenses = onSnapshot(expensesQuery, (expensesSnapshot) => {
                const allExpenses = expensesSnapshot.docs.map(doc => ({...doc.data(), fecha: (doc.data().fecha as Timestamp).toDate()}) as Expense);

                 // Filter for current quarter
                const quarterExpenses = allExpenses.filter(exp => exp.fecha >= startOfCurrentQuarter && exp.fecha <= endOfCurrentQuarter);
                const totalExpensesInQuarter = quarterExpenses.reduce((sum, exp) => sum + exp.importe, 0);
                
                const calculatedNetProfit = totalPaidInQuarter - totalExpensesInQuarter;
                setNetProfit(calculatedNetProfit);

                const baseIRPF = calculatedNetProfit > 0 ? calculatedNetProfit : 0;
                setTaxIRPF(baseIRPF * 0.20); // 20% estimation

                // -- Bar Chart Data (last 6 months) --
                const sixMonthsAgo = startOfMonth(subMonths(now, 5));
                const monthlyData = Array.from({ length: 6 }, (_, i) => {
                    const d = subMonths(now, 5 - i);
                    return { month: format(d, 'MMM', { locale: es }), income: 0, expenses: 0 };
                });

                allInvoices.forEach(inv => {
                    if (inv.fechaEmision >= sixMonthsAgo && inv.estado === 'Pagado') {
                        const monthIndex = (inv.fechaEmision.getMonth() - sixMonthsAgo.getMonth() + 12) % 12;
                        if(monthlyData[monthIndex]) monthlyData[monthIndex].income += inv.importe;
                    }
                });
                allExpenses.forEach(exp => {
                    if (exp.fecha >= sixMonthsAgo) {
                        const monthIndex = (exp.fecha.getMonth() - sixMonthsAgo.getMonth() + 12) % 12;
                         if(monthlyData[monthIndex]) monthlyData[monthIndex].expenses += exp.importe;
                    }
                });
                setIncomeVsExpensesData(monthlyData as any);

                // -- Pie Chart Data (current month) --
                const startOfThisMonth = startOfMonth(now);
                const endOfThisMonth = endOfMonth(now);
                const monthExpenses = allExpenses.filter(exp => exp.fecha >= startOfThisMonth && exp.fecha <= endOfThisMonth);
                const categoryTotals = monthExpenses.reduce((acc, exp) => {
                    acc[exp.categoria] = (acc[exp.categoria] || 0) + exp.importe;
                    return acc;
                }, {} as Record<string, number>);

                setExpenseCategoriesData(Object.entries(categoryTotals).map(([name, value], index) => ({
                    name,
                    value,
                    fill: COLORS[index % COLORS.length]
                })));

                setLoading(false);
            });

            return () => unsubscribeExpenses();
        });

        return () => unsubscribeInvoices();

    }, [user]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Visión General Financiera</h1>
      <p className="text-muted-foreground">
        Tu centro de mando para la salud económica de tu negocio.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Beneficio Neto (Trimestre)</CardTitle>
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
                <p className="text-xs text-muted-foreground">Total por cobrar</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Previsión IVA (Trimestre)</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{taxIVA.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</div>
                <p className="text-xs text-muted-foreground">Estimación a pagar (Modelo 303)</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Previsión IRPF (Trimestre)</CardTitle>
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
                <CardDescription>Últimos 6 meses</CardDescription>
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
                <CardTitle>Desglose de Gastos</CardTitle>
                <CardDescription>Categorías principales este mes</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={{}} className="h-[300px] w-full">
                    <PieChart>
                         <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                        <Pie data={expenseCategoriesData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                             {expenseCategoriesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                            <LabelList dataKey="name" className="fill-background text-sm" stroke="hsl(var(--foreground))" strokeWidth={0.5} />
                        </Pie>
                    </PieChart>
                </ChartContainer>
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
  );
}
