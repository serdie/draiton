
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

type ActivityItem = {
    id: string;
    type: 'Gasto' | 'Ingreso' | 'Contacto' | 'Proyecto' | 'Tarea';
    text: string;
    time: string;
};

const recentActivitiesData: ActivityItem[] = [
    { id: '1', type: 'Ingreso', text: "Factura #2023-015 enviada a 'Tech Solutions'", time: 'hace 15m' },
    { id: '2', type: 'Gasto', text: "Nuevo gasto 'Suscripción a Figma' añadido", time: 'hace 1h' },
    { id: '3', type: 'Tarea', text: "Tarea 'Preparar reunión' completada", time: 'hace 3h' },
    { id: '4', type: 'Proyecto', text: "Proyecto 'Rediseño Web' actualizado", time: 'hace 5h' },
];

const financialChartData = [
  { month: 'Ene', total: 0 },
  { month: 'Feb', total: 0 },
  { month: 'Mar', total: 0 },
  { month: 'Abr', total: 0 },
  { month: 'May', total: 0 },
  { month: 'Jun', total: 0 },
];

export default function DashboardPage() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [income, setIncome] = useState(12450);
    const [expenses, setExpenses] = useState(5820);
    const [activeProjects, setActiveProjects] = useState(3);
    const [pendingTasks, setPendingTasks] = useState(8);
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>(recentActivitiesData);

    const netProfit = income - expenses;

    // TODO: Re-enable data fetching when backend is ready
    // useEffect(() => {
    //     if (!user || !db) {
    //         setLoading(false);
    //         return;
    //     }
    //     // ... data fetching logic
    // }, [user]);
    
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">Ingresos</p>
                            <p className="text-2xl font-bold text-green-500 dark:text-green-400">{formatCurrency(income)}</p>
                        </div>
                        <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">Gastos</p>
                            <p className="text-2xl font-bold text-red-500 dark:text-red-400">{formatCurrency(expenses)}</p>
                        </div>
                        <div className="p-4 bg-secondary rounded-lg">
                            <p className="text-sm text-muted-foreground">Beneficio Neto</p>
                            <p className="text-2xl font-bold">{formatCurrency(netProfit)}</p>
                        </div>
                    </div>
                    <div className="h-[200px] w-full">
                       <ChartContainer config={{}} className="h-full w-full">
                            <BarChart data={financialChartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} width={80} tickFormatter={(value) => formatCurrency(value)} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="total" fill="hsl(var(--primary))" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generar Previsión con IA
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Asistente IA</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-secondary rounded-lg flex items-center justify-between">
                         <p className="text-muted-foreground">¡Hola! Soy GestorIA. Pregúntame sobre impuestos, facturas, o cómo optimizar tu negocio.</p>
                         <Button variant="ghost" size="icon">
                            <Sparkles className="text-primary" />
                         </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
        <aside className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Operaciones</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary rounded-lg text-center">
                        <p className="text-3xl font-bold text-primary">{activeProjects}</p>
                        <p className="text-sm text-muted-foreground">Proyectos Activos</p>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg text-center">
                        <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-400">{pendingTasks}</p>
                        <p className="text-sm text-muted-foreground">Tareas Pendientes</p>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {recentActivities.map(item => (
                             <li key={item.id} className="text-sm flex justify-between">
                                <span className="text-foreground/90">{item.text}</span>
                                <span className="text-muted-foreground shrink-0">{item.time}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </aside>
     </div>
    </div>
  );
}
