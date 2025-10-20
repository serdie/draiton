
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { collection, query, where, getDocs, orderBy, limit, Timestamp, type DocumentData, type QuerySnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Document } from './documentos/page';
import type { Expense } from './gastos/page';
import type { Contact } from './contactos/page';
import type { Project, ProjectStatus } from './proyectos/page';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { AiAssistantChat } from './ai-assistant-chat';
import type { Task } from './tareas/types';

type ActivityItem = {
    id: string;
    type: 'Gasto' | 'Ingreso' | 'Contacto' | 'Proyecto' | 'Tarea';
    text: string;
    date: Date;
    time: string;
};

type Period = 'mensual' | 'trimestral' | 'semestral' | 'anual';

const initialFinancialChartData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(new Date(), 5 - i);
    return { month: format(d, 'MMM', { locale: es }), income: 0, expenses: 0 };
});


export default function DashboardPage() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState<Period>('semestral');
    
    // Financial states
    const [income, setIncome] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [financialChartData, setFinancialChartData] = useState(initialFinancialChartData);
    
    // Other states
    const [activeProjects, setActiveProjects] = useState(0);
    const [pendingTasks, setPendingTasks] = useState(0);
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        if (!user || !db) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Determine date range based on selected period
                const now = new Date();
                let startDate: Date;
                let endDate: Date = endOfMonth(now);

                switch (periodo) {
                    case 'mensual':
                        startDate = startOfMonth(now);
                        break;
                    case 'trimestral':
                        startDate = startOfQuarter(now);
                        endDate = endOfQuarter(now);
                        break;
                    case 'anual':
                        startDate = startOfYear(now);
                        endDate = endOfYear(now);
                        break;
                    case 'semestral':
                    default:
                        startDate = startOfMonth(subMonths(now, 5));
                        break;
                }

                // Fetch Invoices
                const invoicesQuery = query(collection(db, 'invoices'), where('ownerId', '==', user.uid), where('estado', '==', 'Pagado'));
                const invoicesSnapshot = await getDocs(invoicesQuery);
                const allInvoices = invoicesSnapshot.docs.map(doc => ({...doc.data(), fechaEmision: (doc.data().fechaEmision as Timestamp).toDate()}) as Document);
                
                const filteredInvoices = allInvoices.filter(inv => {
                    const invDate = inv.fechaEmision;
                    return invDate >= startDate && invDate <= endDate;
                });
                const totalIncome = filteredInvoices.reduce((acc, doc) => acc + doc.importe, 0);
                setIncome(totalIncome);

                // Fetch Expenses
                const expensesQuery = query(collection(db, 'expenses'), where('ownerId', '==', user.uid));
                const expensesSnapshot = await getDocs(expensesQuery);
                const allExpenses = expensesSnapshot.docs.map(doc => ({...doc.data(), fecha: (doc.data().fecha as Timestamp).toDate()}) as Expense);

                const filteredExpenses = allExpenses.filter(exp => {
                    const expDate = exp.fecha;
                    return expDate >= startDate && expDate <= endDate;
                });
                const totalExpenses = filteredExpenses.reduce((acc, doc) => acc + doc.importe, 0);
                setExpenses(totalExpenses);
                
                // Process chart data
                let chartDataTemplate: { month: string, income: number, expenses: number, year: number, monthNum: number }[];
                if (periodo === 'anual') {
                    chartDataTemplate = Array.from({ length: 12 }, (_, i) => {
                        const d = new Date(now.getFullYear(), i, 1);
                        return { month: format(d, 'MMM', { locale: es }), income: 0, expenses: 0, year: d.getFullYear(), monthNum: d.getMonth() };
                    });
                } else {
                     chartDataTemplate = Array.from({ length: 6 }, (_, i) => {
                        const d = subMonths(now, 5 - i);
                        return { month: format(d, 'MMM', { locale: es }), income: 0, expenses: 0, year: d.getFullYear(), monthNum: d.getMonth() };
                    });
                }
                
                filteredInvoices.forEach(inv => {
                    const invDate = inv.fechaEmision;
                    const monthStr = format(invDate, 'MMM', { locale: es });
                    const chartEntry = chartDataTemplate.find(d => d.month === monthStr && d.year === invDate.getFullYear());
                    if (chartEntry) {
                        chartEntry.income += inv.importe;
                    }
                });

                filteredExpenses.forEach(exp => {
                    const expDate = exp.fecha;
                     const monthStr = format(expDate, 'MMM', { locale: es });
                    const chartEntry = chartDataTemplate.find(d => d.month === monthStr && d.year === expDate.getFullYear());
                    if (chartEntry) {
                        chartEntry.expenses += exp.importe;
                    }
                });
                
                setFinancialChartData(chartDataTemplate as any);

                // Fetch Projects
                const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', user.uid), where('status', 'in', ['En Progreso', 'Planificación']));
                const projectsSnapshot = await getDocs(projectsQuery);
                setActiveProjects(projectsSnapshot.size);

                 // Fetch Pending Tasks
                const tasksQuery = query(collection(db, 'tasks'), where('ownerId', '==', user.uid), where('isCompleted', '==', false));
                const tasksSnapshot = await getDocs(tasksQuery);
                setPendingTasks(tasksSnapshot.size);

                // Recent Activities
                const processSnapshot = (
                    snapshot: QuerySnapshot<DocumentData>,
                    type: ActivityItem['type'],
                    textFieldFn: (data: DocumentData) => string,
                    dateField: string
                ): Omit<ActivityItem, 'time'>[] => {
                    return snapshot.docs.map(doc => {
                        const data = doc.data();
                        const dateValue = data[dateField];
                        return {
                            id: doc.id,
                            type: type,
                            text: textFieldFn(data),
                            date: dateValue instanceof Timestamp ? dateValue.toDate() : new Date(dateValue),
                        };
                    });
                };

                const [
                    invoicesSnap,
                    expensesSnap,
                    projectsSnap,
                    tasksSnap,
                    contactsSnap
                ] = await Promise.all([
                    getDocs(query(collection(db, 'invoices'), where('ownerId', '==', user.uid), orderBy('fechaEmision', 'desc'), limit(5))),
                    getDocs(query(collection(db, 'expenses'), where('ownerId', '==', user.uid), orderBy('fecha', 'desc'), limit(5))),
                    getDocs(query(collection(db, 'projects'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5))),
                    getDocs(query(collection(db, 'tasks'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5))),
                    getDocs(query(collection(db, 'contacts'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'), limit(5)))
                ]);

                const activities = [
                    ...processSnapshot(invoicesSnap, 'Ingreso', data => `Factura #${data.numero} para ${data.cliente}`, 'fechaEmision'),
                    ...processSnapshot(expensesSnap, 'Gasto', data => `Gasto de ${data.proveedor} (${data.categoria})`, 'fecha'),
                    ...processSnapshot(projectsSnap, 'Proyecto', data => `Nuevo proyecto: ${data.name}`, 'createdAt'),
                    ...processSnapshot(tasksSnap, 'Tarea', data => `Nueva tarea: ${data.title}`, 'createdAt'),
                    ...processSnapshot(contactsSnap, 'Contacto', data => `Nuevo contacto: ${data.name}`, 'createdAt'),
                ];
                
                const sortedActivities = activities
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .slice(0, 4)
                    .map(act => ({...act, time: format(act.date, 'dd MMM', { locale: es })}));

                setRecentActivities(sortedActivities);

            } catch (error) {
                console.error("Error fetching dashboard data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, periodo]);
    
    const netProfit = income - expenses;
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Bienvenido, {user?.displayName?.split(' ')[0] || 'Usuario'}
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu negocio de hoy.
        </p>
      </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <main className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Visión Financiera</CardTitle>
                     <Select value={periodo} onValueChange={(value) => setPeriodo(value as Period)}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Seleccionar periodo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mensual">Este Mes</SelectItem>
                            <SelectItem value="trimestral">Este Trimestre</SelectItem>
                            <SelectItem value="semestral">Últimos 6 meses</SelectItem>
                            <SelectItem value="anual">Este Año</SelectItem>
                            <SelectItem value="personalizado" disabled>Personalizado</SelectItem>
                        </SelectContent>
                    </Select>
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

             <Card className="flex flex-col h-[480px]">
                <AiAssistantChat />
            </Card>

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

             <Card>
                <CardHeader>
                    <CardTitle>Accesos Rápidos</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2">
                    <Button variant="outline" asChild><Link href="/dashboard/documentos"><FileText className="mr-2"/>Factura</Link></Button>
                    <Button variant="outline" asChild><Link href="/dashboard/proyectos"><Briefcase className="mr-2"/>Proyecto</Link></Button>
                    <Button variant="outline" asChild><Link href="/dashboard/contactos"><UserPlus className="mr-2"/>Contacto</Link></Button>
                    <Button variant="outline" asChild><Link href="/dashboard/gastos"><Landmark className="mr-2"/>Gasto</Link></Button>
                </CardContent>
            </Card>
        </aside>
     </div>
    </div>
  );
}
