
'use client';

import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Send, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { AiAssistantChat } from '@/app/dashboard/ai-assistant-chat';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, startOfQuarter, endOfQuarter, startOfYear, endOfYear, getQuarter } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { AuthContext } from '@/context/auth-context';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Document } from '../documentos/page';
import type { Expense } from '../gastos/page';


const taxModels = [
    { name: 'Modelo 303 (IVA Trimestral)', link: '/dashboard/gestor-ia/asistente-fiscal?modelo=303' },
    { name: 'Modelo 130 (IRPF Trimestral)', link: '/dashboard/gestor-ia/asistente-fiscal?modelo=130' },
    { name: 'Modelo 111 (Retenciones)', link: '/dashboard/gestor-ia/asistente-fiscal?modelo=111' },
    { name: 'Modelo 115 (Alquileres)', link: '/dashboard/gestor-ia/asistente-fiscal?modelo=115' },
];

type PeriodValue = 'q1' | 'q2' | 'q3' | 'q4' | 'custom';

const getQuarterDateRange = (quarter: number): DateRange => {
    const year = new Date().getFullYear();
    const startDate = startOfQuarter(new Date(year, (quarter - 1) * 3));
    const endDate = endOfQuarter(new Date(year, (quarter - 1) * 3));
    return { from: startDate, to: endDate };
}

const getPeriodLabel = (period: PeriodValue): string => {
    switch (period) {
        case 'q1': return '1er Trimestre';
        case 'q2': return '2º Trimestre';
        case 'q3': return '3er Trimestre';
        case 'q4': return '4º Trimestre';
        default: return 'Personalizado';
    }
}


export function ImpuestosTab() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<PeriodValue>(`q${getQuarter(new Date())}` as PeriodValue);
    const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
    
    const [taxIVA, setTaxIVA] = useState(0);
    const [taxIRPF, setTaxIRPF] = useState(0);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        let dateRange: DateRange | undefined;
        if (period === 'custom') {
            dateRange = customDateRange;
        } else {
            dateRange = getQuarterDateRange(parseInt(period.replace('q','')));
        }
        
        if (!dateRange || !dateRange.from) {
             setTaxIVA(0);
             setTaxIRPF(0);
             return;
        }

        setLoading(true);
        const { from: startDate, to: endDate = new Date() } = dateRange;

        // Invoices listener
        const invoicesQuery = query(collection(db, 'invoices'), where('ownerId', '==', user.uid));
        const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
            const allInvoices = snapshot.docs.map(doc => ({...doc.data(), fechaEmision: (doc.data().fechaEmision as Timestamp).toDate()}) as Document);
            const periodInvoices = allInvoices.filter(inv => inv.fechaEmision >= startDate && inv.fechaEmision <= endDate);
            
            const totalPaidInPeriod = periodInvoices.filter(i => i.estado === 'Pagado').reduce((sum, i) => sum + i.subtotal, 0);
            const ivaDevengado = periodInvoices.reduce((sum, i) => sum + i.impuestos, 0);
            
            // Expenses listener (nested to calculate net profit)
            const expensesQuery = query(collection(db, 'expenses'), where('ownerId', '==', user.uid));
            const unsubscribeExpenses = onSnapshot(expensesQuery, (expensesSnapshot) => {
                const allExpenses = expensesSnapshot.docs.map(doc => ({...doc.data(), fecha: (doc.data().fecha as Timestamp).toDate()}) as Expense);
                const periodExpenses = allExpenses.filter(exp => exp.fecha >= startDate && exp.fecha <= endDate);
                const totalExpensesInPeriod = periodExpenses.reduce((sum, exp) => sum + exp.importe, 0);
                
                const netProfit = totalPaidInPeriod - totalExpensesInPeriod;
                setTaxIRPF(netProfit > 0 ? netProfit * 0.20 : 0);

                const ivaSoportado = periodExpenses.reduce((sum, i) => sum + (i.importe * 0.21 / 1.21), 0);
                setTaxIVA(ivaDevengado - ivaSoportado);
                setLoading(false);
            });
            return () => unsubscribeExpenses();
        });

        return () => unsubscribeInvoices();

    }, [user, period, customDateRange]);
    
    const totalTaxes = taxIVA + taxIRPF;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Previsión de Impuestos</CardTitle>
                     <div className="pt-2 space-y-2">
                        <Select value={period} onValueChange={(value) => setPeriod(value as PeriodValue)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar Periodo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="q1">1er Trimestre</SelectItem>
                                <SelectItem value="q2">2º Trimestre</SelectItem>
                                <SelectItem value="q3">3er Trimestre</SelectItem>
                                <SelectItem value="q4">4º Trimestre</SelectItem>
                                <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>
                        {period === 'custom' && (
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !customDateRange && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {customDateRange?.from ? (customDateRange.to ? (<>{format(customDateRange.from, "dd LLL, y")} - {format(customDateRange.to, "dd LLL, y")}</>) : (format(customDateRange.from, "dd LLL, y"))) : (<span>Elige un rango</span>)}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar initialFocus mode="range" defaultMonth={customDateRange?.from} selected={customDateRange} onSelect={setCustomDateRange} numberOfMonths={2} locale={es}/>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </CardHeader>
                 {loading ? (
                    <CardContent className="h-[150px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                    </CardContent>
                ) : (
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">IVA a pagar</span>
                            <span className="font-bold text-lg">{taxIVA.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">IRPF a cuenta</span>
                            <span className="font-bold text-lg">{taxIRPF.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-baseline text-primary">
                            <span className="font-semibold">Total a liquidar</span>
                            <span className="font-bold text-2xl">{totalTaxes.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                        </div>
                    </CardContent>
                )}
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Modelos Tributarios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                   {taxModels.map((model) => (
                        <div key={model.name} className="flex justify-between items-center p-2 hover:bg-muted rounded-md">
                            <span className="text-sm">{model.name}</span>
                            <Button asChild variant="link" className="pr-0">
                                <Link href={model.link}>Preparar</Link>
                            </Button>
                        </div>
                   ))}
                </CardContent>
            </Card>
        </div>

        <Card className="lg:col-span-2 flex flex-col h-[600px] lg:h-auto">
           <AiAssistantChat />
        </Card>
    </div>
  );
}
