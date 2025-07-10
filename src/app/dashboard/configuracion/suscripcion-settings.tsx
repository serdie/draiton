
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CreditCard as CreditCardIcon } from 'lucide-react';

const billingHistory = [
    { id: 'INV-2024-003', date: '15 de Julio, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
    { id: 'INV-2024-002', date: '15 de Junio, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
    { id: 'INV-2024-001', date: '15 de Mayo, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
];

export function SuscripcionSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suscripción y Facturación</CardTitle>
        <CardDescription>Gestiona tu plan de suscripción y revisa tu historial de pagos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">

        {/* Current Plan Section */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Tu Plan Actual</h3>
          <Card className="bg-muted/50">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <Badge color="accent" className="mb-2 bg-accent text-accent-foreground">Plan Pro</Badge>
                <p className="text-2xl font-bold">4.95€<span className="text-base font-normal text-muted-foreground">/mes</span></p>
                <p className="text-sm text-muted-foreground">Tu plan se renueva el 15 de Agosto, 2024.</p>
              </div>
              <Button asChild>
                <Link href="/#pricing">Cambiar de Plan</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Separator />
        
        {/* Payment Method Section */}
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Método de Pago</h3>
            <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                    <CreditCardIcon className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="font-medium">Visa terminada en 4242</p>
                        <p className="text-sm text-muted-foreground">Expira 12/2026</p>
                    </div>
                </div>
                 <Button variant="outline">Actualizar</Button>
            </div>
        </div>
        
        <Separator />

        {/* Billing History Section */}
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Historial de Facturación</h3>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nº Factura</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Importe</TableHead>
                            <TableHead className="text-right">Acción</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {billingHistory.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">{invoice.id}</TableCell>
                                <TableCell className="text-muted-foreground">{invoice.date}</TableCell>
                                <TableCell>{invoice.description}</TableCell>
                                <TableCell className="text-right">{invoice.amount}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
                                        <span className="sr-only">Descargar factura</span>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>

      </CardContent>
    </Card>
  );
}
