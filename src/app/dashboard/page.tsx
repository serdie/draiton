
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

type ActivityItem = {
    id: string;
    type: 'Gasto' | 'Ingreso' | 'Contacto' | 'Proyecto';
    text: string;
    date: Date;
    user: string;
    avatar: string;
};


export default function DashboardPage() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [income, setIncome] = useState(0);
    const [expenses, setExpenses] = useState(0);
    const [activeProjects, setActiveProjects] = useState(0);
    const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        if (!user || !db) return;

        const fetchData = async () => {
            setLoading(true);
            
            // --- Financial Data ---
            // Income (Paid Invoices)
            const invoicesQuery = query(collection(db, 'invoices'), where('ownerId', '==', user.uid), where('estado', '==', 'Pagado'));
            const invoicesSnapshot = await getDocs(invoicesQuery);
            const totalIncome = invoicesSnapshot.docs.reduce((sum, doc) => sum + (doc.data() as Document).importe, 0);
            setIncome(totalIncome);

            // Expenses
            const expensesQuery = query(collection(db, 'expenses'), where('ownerId', '==', user.uid));
            const expensesSnapshot = await getDocs(expensesQuery);
            const totalExpenses = expensesSnapshot.docs.reduce((sum, doc) => sum + (doc.data() as Expense).importe, 0);
            setExpenses(totalExpenses);

             // --- Recent Activity ---
            const activities: ActivityItem[] = [];

            // Paid Invoices
            const paidInvoicesQuery = query(collection(db, 'invoices'), where('ownerId', '==', user.uid), where('estado', '==', 'Pagado'), orderBy('fechaEmision', 'desc'), limit(4));
            const paidInvoicesSnapshot = await getDocs(paidInvoicesQuery);
            paidInvoicesSnapshot.forEach(doc => {
                const invoice = doc.data() as Document;
                activities.push({
                    id: doc.id,
                    type: 'Ingreso',
                    text: `La factura ${invoice.numero} ha sido pagada.`,
                    date: invoice.fechaEmision instanceof Timestamp ? invoice.fechaEmision.toDate() : new Date(invoice.fechaEmision),
                    user: invoice.cliente,
                    avatar: '/other-avatar.png'
                });
            });

            // New Expenses
            const newExpensesQuery = query(collection(db, 'expenses'), where('ownerId', '==', user.uid), orderBy('fecha', 'desc'), limit(4));
            const newExpensesSnapshot = await getDocs(newExpensesQuery);
            newExpensesSnapshot.forEach(doc => {
                const expense = doc.data() as Expense;
                activities.push({
                    id: doc.id,
                    type: 'Gasto',
                    text: `Has añadido un nuevo gasto de ${expense.importe.toFixed(2)}€ de ${expense.proveedor}.`,
                    date: expense.fecha instanceof Timestamp ? expense.fecha.toDate() : new Date(expense.fecha),
                    user: 'Tú',
                    avatar: '/user-avatar.png'
                });
            });

             // New Contacts
            const newContactsQuery = query(collection(db, 'contacts'), where('ownerId', '==', user.uid), orderBy('createdAt', 'desc'), limit(4));
            const newContactsSnapshot = await getDocs(newContactsQuery);
            newContactsSnapshot.forEach(doc => {
                const contact = doc.data() as Contact;
                activities.push({
                    id: doc.id,
                    type: 'Contacto',
                    text: `Has añadido a ${contact.name} como nuevo ${contact.type}.`,
                    date: contact.createdAt instanceof Timestamp ? contact.createdAt.toDate() : new Date(contact.createdAt),
                    user: 'Tú',
                    avatar: '/user-avatar.png'
                });
            });
            
            // Sort all activities by date and take the last 4
            const sortedActivities = activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 4);
            setRecentActivities(sortedActivities);


            setLoading(false);
        };

        fetchData();
    }, [user]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Panel de Control
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de la actividad de tu negocio.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">
              Resumen Financiero
            </CardTitle>
            <Landmark className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
           <CardContent className="flex justify-around gap-4">
            {loading ? (
                 <div className="flex justify-center items-center w-full h-24">
                     <Loader2 className="h-6 w-6 animate-spin" />
                 </div>
            ) : (
                <>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Ingresos (Pagados)</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(income)}</p>
                    <p className="text-xs text-muted-foreground">Este Mes</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Gastos</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(expenses)}</p>
                    <p className="text-xs text-muted-foreground">Este Mes</p>
                </div>
                </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">
              Proyectos Activos
            </CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <p className="text-3xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Proyectos en curso</p>
            </div>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/proyectos">Ver Proyectos</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">
              Perspectivas con IA
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Obtén sugerencias de IA para tu negocio.
            </p>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/perspectivas-ia">Explorar Perspectivas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Actividad Reciente</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               {loading ? (
                    <div className="flex justify-center items-center w-full h-40">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                            <AvatarImage src={activity.avatar} alt="Avatar" />
                            <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{activity.user}</span> {activity.text}
                            </p>
                        </div>
                        ))
                    ) : (
                         <p className="text-sm text-muted-foreground text-center py-10">No hay actividad reciente.</p>
                    )}
                    </div>
                )}
            </CardContent>
             <CardFooter>
              <Button variant="link" asChild className="w-full">
                <Link href="#">Ver toda la actividad <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Accede a las funciones más comunes.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button asChild>
                <Link href="/dashboard/documentos">
                  <FileText className="mr-2" />
                  Crear Factura
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/contactos">
                  <UserPlus className="mr-2" />
                  Añadir Contacto
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/gastos">
                  <Landmark className="mr-2" />
                  Registrar Gasto
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/proyectos">
                  <Plus className="mr-2" />
                  Nuevo Proyecto
                </Link>
              </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
