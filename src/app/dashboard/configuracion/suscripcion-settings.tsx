
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CreditCard as CreditCardIcon, CheckCircle, PlusCircle, Eye } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '@/context/auth-context';
import Image from 'next/image';
import { ViewDocumentModal } from '../documentos/view-document-modal';
import type { Document } from '../documentos/page';

const billingHistory = [
    { id: 'INV-2024-003', date: '15 de Julio, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
    { id: 'INV-2024-002', date: '15 de Junio, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
    { id: 'INV-2024-001', date: '15 de Mayo, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
];

const StripeLogo = () => (
    <Image src="https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/Stripe%20wordmark%20-%20Blurple%20-%20Large.png?alt=media&token=26ab483a-3f39-428a-9a3b-e257fea86f32" alt="Stripe" width={100} height={40} className="object-contain" data-ai-hint="Stripe logo" />
);

const PayPalLogo = () => (
    <Image src="https://www.paypalobjects.com/webstatic/mktg/logo-center/logotipo_paypal_pagos.png" alt="PayPal" width={111} height={69} data-ai-hint="PayPal logo" />
);

export function SuscripcionSettings() {
    const { user } = useContext(AuthContext);
    const [invoiceToView, setInvoiceToView] = useState<Document | null>(null);

    const planDetails = {
        free: { name: 'Gratis', price: '0€', interval: '/mes', renewal: 'Tu plan es gratuito y no se renueva.' },
        pro: { name: 'Pro', price: '4.95€', interval: '/mes', renewal: 'Tu plan se renueva el 15 de Agosto, 2024.' },
        empresa: { name: 'Empresa', price: '29€', interval: '/mes', renewal: 'Tu plan se renueva el 15 de Agosto, 2024.' },
        admin: { name: 'Admin', price: 'N/A', interval: '', renewal: 'Tienes acceso de administrador.' },
        employee: { name: 'Empleado', price: 'N/A', interval: '', renewal: 'Perteneces a una cuenta de empresa.'}
    };

    const currentPlan = user?.role ? planDetails[user.role] : planDetails['free'];

    const handleViewInvoice = (invoiceData: typeof billingHistory[0]) => {
        if (!user) return;
        
        const mockDocument: Document = {
            id: invoiceData.id,
            numero: invoiceData.id,
            cliente: user.displayName || 'Usuario',
            estado: 'Pagado',
            fechaEmision: new Date(invoiceData.date),
            fechaVto: null,
            importe: parseFloat(invoiceData.amount.replace('€', '')),
            subtotal: parseFloat(invoiceData.amount.replace('€', '')) / 1.21,
            impuestos: parseFloat(invoiceData.amount.replace('€', '')) - (parseFloat(invoiceData.amount.replace('€', '')) / 1.21),
            lineas: [{
                description: invoiceData.description,
                quantity: 1,
                unit: 'unidad',
                unitPrice: parseFloat(invoiceData.amount.replace('€', '')) / 1.21,
                total: parseFloat(invoiceData.amount.replace('€', '')) / 1.21
            }],
            moneda: 'EUR',
            ownerId: user.uid,
            tipo: 'factura'
        };
        setInvoiceToView(mockDocument);
    };


  return (
    <>
    {invoiceToView && (
        <ViewDocumentModal
            isOpen={!!invoiceToView}
            onClose={() => setInvoiceToView(null)}
            document={invoiceToView}
        />
    )}
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
                <Badge color="accent" className="mb-2 bg-accent text-accent-foreground">{currentPlan.name}</Badge>
                <p className="text-2xl font-bold">{currentPlan.price}<span className="text-base font-normal text-muted-foreground">{currentPlan.interval}</span></p>
                <p className="text-sm text-muted-foreground">{currentPlan.renewal}</p>
              </div>
              {user?.role !== 'admin' && user?.role !== 'employee' && (
                <Button asChild>
                    <Link href="/seleccionar-plan">Cambiar de Plan</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Separator />
        
        {/* Payment Method Section */}
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Método de Pago</h3>
            {user?.role === 'free' || user?.role === 'employee' ? (
                <p className="text-sm text-muted-foreground">No se requiere un método de pago para tu plan actual.</p>
            ) : (
                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <StripeLogo />
                                <div>
                                    <p className="font-medium">Tarjeta de crédito</p>
                                    <p className="text-sm text-muted-foreground">Visa terminada en 4242</p>
                                </div>
                            </div>
                            <Button variant="outline" asChild>
                              <Link href="#" target="_blank">Gestionar en Stripe</Link>
                            </Button>
                        </CardContent>
                    </Card>
                     <Card className="border-dashed">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <PayPalLogo />
                                <div>
                                    <p className="font-medium text-muted-foreground">Conectar con PayPal</p>
                                </div>
                            </div>
                            <Button variant="secondary" asChild>
                               <Link href="#" target="_blank">Conectar</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
        
        <Separator />

        {/* Billing History Section */}
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Historial de Facturación</h3>
             {user?.role === 'free' || user?.role === 'employee' ? (
                <p className="text-sm text-muted-foreground">No tienes historial de facturación.</p>
             ) : (
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
                                        <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(invoice)}>
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">Ver factura</span>
                                        </Button>
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
             )}
        </div>

      </CardContent>
    </Card>
    </>
  );
}
