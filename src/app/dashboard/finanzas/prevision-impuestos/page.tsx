
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Scale, Percent, Download, Info } from 'lucide-react';

const taxForecastData = [
  { quarter: 'Q1 24', iva: 2150.75, irpf: 1530.20 },
  { quarter: 'Q4 23', iva: 1980.50, irpf: 1450.00 },
  { quarter: 'Q3 23', iva: 2300.00, irpf: 1680.90 },
  { quarter: 'Q2 23', iva: 1850.25, irpf: 1350.60 },
];

const chartConfig = {
  iva: { label: 'IVA (Modelo 303)', color: 'hsl(var(--chart-2))' },
  irpf: { label: 'IRPF (Modelo 130)', color: 'hsl(var(--chart-5))' },
};

export default function PrevisionImpuestosPage() {
  return (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold">Previsión de Impuestos</h1>
                <p className="text-muted-foreground">
                    Una estimación en tiempo real de tus obligaciones fiscales trimestrales.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Select defaultValue="t2-2024">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecciona un trimestre" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="t2-2024">2º Trimestre 2024</SelectItem>
                        <SelectItem value="t1-2024">1º Trimestre 2024</SelectItem>
                        <SelectItem value="t4-2023">4º Trimestre 2023</SelectItem>
                        <SelectItem value="t3-2023">3º Trimestre 2023</SelectItem>
                    </SelectContent>
                </Select>
                 <Button variant="outline">
                    <Download className="mr-2 h-4 w-4"/>
                    Exportar Informe
                </Button>
            </div>
        </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Previsión IVA (Modelo 303)</CardTitle>
                <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">2.150,75 €</div>
                <p className="text-xs text-muted-foreground">Estimación a pagar para el trimestre actual</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Previsión IRPF (Modelo 130)</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">1.530,20 €</div>
                <p className="text-xs text-muted-foreground">Estimación de pago fraccionado para el trimestre</p>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Desglose de Cálculo (Trimestre Actual)</CardTitle>
            <CardDescription>Resumen de los datos utilizados para la estimación.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col space-y-1 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Ingresos (Base Imponible)</p>
                <p className="text-xl font-semibold">15.900,00 €</p>
            </div>
             <div className="flex flex-col space-y-1 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">IVA Repercutido (21%)</p>
                <p className="text-xl font-semibold text-green-600">3.339,00 €</p>
            </div>
             <div className="flex flex-col space-y-1 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Gastos Deducibles</p>
                <p className="text-xl font-semibold">5.710,25 €</p>
            </div>
             <div className="flex flex-col space-y-1 rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">IVA Soportado Deducible</p>
                <p className="text-xl font-semibold text-red-600">-1.188,25 €</p>
            </div>
        </CardContent>
         <CardFooter>
            <div className="flex items-center text-xs text-muted-foreground">
              <Info className="mr-2 h-4 w-4" />
              Estos cálculos son una estimación y no sustituyen el asesoramiento de un profesional.
            </div>
          </CardFooter>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Evolución Fiscal</CardTitle>
            <CardDescription>Comparativa de impuestos estimados en los últimos trimestres.</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={taxForecastData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="quarter" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickFormatter={(value) => `${value/1000}k`}/>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="iva" fill="var(--color-iva)" radius={4} />
                    <Bar dataKey="irpf" fill="var(--color-irpf)" radius={4} />
                </BarChart>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
