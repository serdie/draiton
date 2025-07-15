
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, BarChart, Users, DollarSign } from 'lucide-react';

const profitAndLossData = [
    { item: 'Ingresos por Proyectos', amount: 12500, type: 'income' },
    { item: 'Venta de Productos', amount: 3400, type: 'income' },
    { item: 'Total Ingresos', amount: 15900, type: 'total-income' },
    { item: 'Coste de Software', amount: -450, type: 'expense' },
    { item: 'Gastos de Oficina', amount: -800, type: 'expense' },
    { item: 'Marketing y Publicidad', amount: -1200, type: 'expense' },
    { item: 'Total Gastos', amount: -2450, type: 'total-expense' },
    { item: 'Beneficio Neto', amount: 13450, type: 'net' },
]

const topClientsData = [
    { client: 'Innovate Corp', revenue: 7500 },
    { client: 'Digital Solutions', revenue: 4000 },
    { client: 'Marketing Pro', revenue: 1000 },
]

export default function InformesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Informes y Analíticas</h1>
            <p className="text-muted-foreground">
              Visualiza el rendimiento de tu negocio con informes detallados.
            </p>
          </div>
           <div className="flex items-center gap-2">
                <Select defaultValue="this-quarter">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecciona un periodo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="this-month">Este Mes</SelectItem>
                        <SelectItem value="this-quarter">Este Trimestre</SelectItem>
                        <SelectItem value="this-year">Este Año</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4"/>
                    Exportar
                </Button>
           </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md"><DollarSign className="h-6 w-6 text-primary"/></div>
                    <CardTitle>Pérdidas y Ganancias (P&G)</CardTitle>
                </div>
                <CardDescription>Resumen de tus ingresos y gastos para el periodo seleccionado.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {profitAndLossData.map((row, i) => (
                            <TableRow key={i} className={row.type.startsWith('total') ? 'font-bold' : ''}>
                                <TableCell className={row.type === 'net' ? 'text-lg font-bold' : ''}>{row.item}</TableCell>
                                <TableCell className={`text-right ${row.type === 'net' ? 'text-lg font-bold' : ''} ${row.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(row.amount)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
             <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md"><Users className="h-6 w-6 text-primary"/></div>
                    <CardTitle>Clientes Más Rentables</CardTitle>
                </div>
                <CardDescription>Clientes que más ingresos han generado en el periodo.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead className="text-right">Ingresos</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topClientsData.map((client, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-medium">{client.client}</TableCell>
                                <TableCell className="text-right">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(client.revenue)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
