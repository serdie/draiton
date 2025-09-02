
'use client';

import {
  Activity,
  ArrowRight,
  Briefcase,
  FileText,
  Landmark,
  Plus,
  TrendingUp,
  UserPlus,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import Link from 'next/link';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Document } from './documentos/page';
import type { Expense } from './gastos/page';
import type { Contact } from './contactos/page';
import type { Project, ProjectStatus } from './proyectos/page';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AiAssistantChat } from './ai-assistant-chat';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

type ActivityItem = {
    id: string;
    type: 'Gasto' | 'Ingreso' | 'Contacto' | 'Proyecto' | 'Tarea';
    text: string;
    time: string;
};

const initialFinancialChartData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return { month: format(d, 'MMM', { locale: es }), income: 0, expenses: 0 };
});


export default function DashboardPage() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [income, setIncome] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [activeProjects, setActiveProjects] = useState(0);
    const [pendingTasks, setPendingTasks] = useState(0);
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
    const [financialChartData, setFinancialChartData] = useState(initialFinancialChartData);

    useEffect(() => {
        if (!user || !db) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Income (Paid Invoices)
                const invoicesQuery = query(collection(db, 'invoices'), where('ownerId', '==', user.uid), where('estado', '==', 'Pagado'));
                const invoicesSnapshot = await getDocs(invoicesQuery);
                const invoices = invoicesSnapshot.docs.map(doc => doc.data() as Document);
                const totalIncome = invoices.reduce((acc, doc) => acc + doc.importe, 0);
                setIncome(totalIncome);

                // Fetch Expenses
                const expensesQuery = query(collection(db, 'expenses'), where('ownerId', '==', user.uid));
                const expensesSnapshot = await getDocs(expensesQuery);
                const expensesData = expensesSnapshot.docs.map(doc => doc.data() as Expense);
                const totalExpenses = expensesData.reduce((acc, doc) => acc + doc.importe, 0);
                setExpenses(totalExpenses);
                
                // Process chart data
                const newChartData = Array.from({ length: 6 }, (_, i) => {
                    const d = subMonths(new Date(), 5 - i);
                    return { month: format(d, 'MMM', { locale: es }), income: 0, expenses: 0, year: d.getFullYear(), monthNum: d.getMonth() };
                });

                invoices.forEach(inv => {
                    const invDate = (inv.fechaEmision as any).toDate();
                    const monthStr = format(invDate, 'MMM', { locale: es });
                    const chartEntry = newChartData.find(d => d.month === monthStr && d.year === invDate.getFullYear());
                    if (chartEntry) {
                        chartEntry.income += inv.importe;
                    }
                });

                expensesData.forEach(exp => {
                    const expDate = (exp.fecha as any).toDate();
                     const monthStr = format(expDate, 'MMM', { locale: es });
                    const chartEntry = newChartData.find(d => d.month === monthStr && d.year === expDate.getFullYear());
                    if (chartEntry) {
                        chartEntry.expenses += exp.importe;
                    }
                });
                
                setFinancialChartData(newChartData);

                // Fetch Projects
                const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', user.uid), where('status', 'in', ['En Progreso', 'Planificación']));
                const projectsSnapshot = await getDocs(projectsQuery);
                setActiveProjects(projectsSnapshot.size);

                 // Recent Activities
                const lastInvoicesQuery = query(collection(db, 'invoices'), where('ownerId', '==', user.uid), orderBy('fechaEmision', 'desc'), limit(3));
                const lastExpensesQuery = query(collection(db, 'expenses'), where('ownerId', '==', user.uid), orderBy('fecha', 'desc'), limit(3));

                const [lastInvoicesSnap, lastExpensesSnap] = await Promise.all([
                    getDocs(lastInvoicesQuery),
                    getDocs(lastExpensesQuery),
                ]);

                const activities: ActivityItem[] = [];
                lastInvoicesSnap.forEach(doc => {
                    const data = doc.data() as Document;
                    activities.push({
                        id: doc.id,
                        type: 'Ingreso',
                        text: `Factura #${data.numero} para ${data.cliente}`,
                        time: format((data.fechaEmision as any).toDate(), 'dd MMM', { locale: es })
                    });
                });
                 lastExpensesSnap.forEach(doc => {
                    const data = doc.data() as Expense;
                    activities.push({
                        id: doc.id,
                        type: 'Gasto',
                        text: `Gasto de ${data.proveedor} (${data.categoria})`,
                        time: format((data.fecha as any).toDate(), 'dd MMM', { locale: es })
                    });
                });
                
                setRecentActivities(activities.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 4));


            } catch (error) {
                console.error("Error fetching dashboard data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);
    
    const netProfit = income - expenses;
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Bienvenida, {user?.displayName?.split(' ')[0] || 'Elena'}
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu negocio de hoy.
        </p>
      </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <main className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Visión Financiera (Últ. 6 meses)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                     {loading ? (
                         <div className="flex justify-center items-center h-[280px]">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                     ) : (
                        <>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 bg-secondary rounded-lg">
                                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                                <p className="text-2xl font-bold text-green-500 dark:text-green-400">{formatCurrency(income)}</p>
                            </div>
                            <div className="p-4 bg-secondary rounded-lg">
                                <p className="text-sm text-muted-foreground">Gastos Totales</p>
                                <p className="text-2xl font-bold text-red-500 dark:text-red-400">{formatCurrency(expenses)}</p>
                            </div>
                            <div className="p-4 bg-secondary rounded-lg">
                                <p className="text-sm text-muted-foreground">Beneficio Neto</p>
                                <p className="text-2xl font-bold">{formatCurrency(netProfit)}</p>
                            </div>
                        </div>
                        <div className="h-[200px] w-full">
                           <ChartContainer config={{
                                income: { label: 'Ingresos', color: 'hsl(var(--chart-2))' },
                                expenses: { label: 'Gastos', color: 'hsl(var(--chart-5))' },
                           }} className="h-full w-full">
                                <BarChart data={financialChartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                    <YAxis tickLine={false} axisLine={false} width={80} tickFormatter={(value) => formatCurrency(value)} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="income" fill="var(--color-income)" radius={4} name="Ingresos" />
                                    <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} name="Gastos" />
                                </BarChart>
                            </ChartContainer>
                        </div>
                        </>
                    )}
                </CardContent>
                <CardFooter>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/finanzas/vision-general">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Ver Análisis Completo
                        </Link>
                    </Button>
                </CardFooter>
            </Card>

            <AiAssistantChat />

        </main>
        <aside className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Operaciones</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                     {loading ? (
                        <div className="col-span-2 flex justify-center items-center h-[88px]">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <>
                        <div className="p-4 bg-secondary rounded-lg text-center">
                            <p className="text-3xl font-bold text-primary">{activeProjects}</p>
                            <p className="text-sm text-muted-foreground">Proyectos Activos</p>
                        </div>
                        <div className="p-4 bg-secondary rounded-lg text-center">
                            <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">{pendingTasks}</p>
                            <p className="text-sm text-muted-foreground">Tareas Pendientes</p>
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                     {loading ? (
                        <div className="flex justify-center items-center h-[160px]">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                     ): (
                        <ul className="space-y-4">
                            {recentActivities.map(item => (
                                 <li key={item.id} className="text-sm flex justify-between gap-2">
                                    <span className="text-foreground/90 truncate">{item.text}</span>
                                    <span className="text-muted-foreground shrink-0">{item.time}</span>
                                </li>
                            ))}
                        </ul>
                     )}
                </CardContent>
            </Card>
        </aside>
     </div>
    </div>
  );
}
