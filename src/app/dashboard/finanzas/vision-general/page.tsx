
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Landmark, Percent, Scale } from 'lucide-react';

const incomeVsExpensesData = [
  { month: 'Ene', income: 4000, expenses: 2400 },
  { month: 'Feb', income: 3000, expenses: 1398 },
  { month: 'Mar', income: 5000, expenses: 9800 },
  { month: 'Abr', income: 2780, expenses: 3908 },
  { month: 'May', income: 1890, expenses: 4800 },
  { month: 'Jun', income: 2390, expenses: 3800 },
];

const chartConfig = {
  income: { label: 'Ingresos', color: 'hsl(var(--chart-2))' },
  expenses: { label: 'Gastos', color: 'hsl(var(--chart-5))' },
};

const expenseCategoriesData = [
  { name: 'Software', value: 450, fill: 'hsl(var(--chart-1))' },
  { name: 'Oficina', value: 800, fill: 'hsl(var(--chart-2))' },
  { name: 'Marketing', value: 1200, fill: 'hsl(var(--chart-3))' },
  { name: 'Viajes', value: 300, fill: 'hsl(var(--chart-4))' },
  { name: 'Suministros', value: 600, fill: 'hsl(var(--chart-5))' },
];

export default function VisionGeneralFinanzasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Visión General Financiera</h1>
      <p className="text-muted-foreground">
        Tu centro de mando para la salud económica de tu negocio.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">13.450,50 €</div>
                <p className="text-xs text-muted-foreground">+20.1% vs el mes pasado</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">2.870,00 €</div>
                <p className="text-xs text-muted-foreground">Total por cobrar</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Previsión IVA (Trimestre)</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">2.150,75 €</div>
                <p className="text-xs text-muted-foreground">Estimación a pagar (Modelo 303)</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Previsión IRPF (Trimestre)</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1.530,20 €</div>
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
                 <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <PieChart>
                         <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                        <Pie data={expenseCategoriesData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={5}>
                             {expenseCategoriesData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
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
