
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CreditCard as CreditCardIcon, CheckCircle, PlusCircle } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import Image from 'next/image';

const billingHistory = [
    { id: 'INV-2024-003', date: '15 de Julio, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
    { id: 'INV-2024-002', date: '15 de Junio, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
    { id: 'INV-2024-001', date: '15 de Mayo, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
];

const StripeLogo = () => (
    <svg width="48" height="20" viewBox="0 0 48 20" fill="none" xmlns="http://www.w3.org/2000/svg" data-ai-hint="Stripe logo">
        <path d="M42.666 4.96C42.066 4.3 41.246 3.82 40.236 3.52C39.226 3.22 38.166 3.07 37.056 3.07C34.336 3.07 32.186 3.85 30.606 5.41C29.036 6.97 28.246 9.07 28.246 11.71C28.246 13.91 28.826 15.69 30.006 17.05C31.186 18.41 32.746 19.09 34.696 19.09C35.906 19.09 36.936 18.87 37.786 18.43C38.646 17.99 39.376 17.36 39.976 16.54L41.656 17.84C40.856 18.96 39.816 19.79 38.536 20.33C37.256 20.87 35.886 21.14 34.426 21.14C31.986 21.14 29.936 20.5 28.276 19.22C26.616 17.94 25.786 16.08 25.786 13.64C25.786 11.83 26.246 10.22 27.166 8.8C28.086 7.38 29.356 6.3 30.976 5.56C32.596 4.82 34.426 4.45 36.466 4.45C37.666 4.45 38.676 4.61 39.496 4.93C40.316 5.25 40.976 5.69 41.476 6.25L42.666 4.96ZM19.284 20.85H24.364V8.5H30.084V4.74H19.284V20.85ZM18.144 14.16C18.434 15.02 18.894 15.72 19.524 16.26C20.154 16.8 20.904 17.07 21.774 17.07C22.614 17.07 23.324 16.81 23.904 16.29C24.484 15.77 24.774 15.09 24.774 14.25C24.774 13.31 24.454 12.57 23.814 12.03C23.174 11.49 22.374 11.22 21.414 11.22H19.284V14.16ZM12.924 20.85H17.474C19.324 20.85 20.854 20.47 22.064 19.71C23.274 18.95 24.124 17.89 24.614 16.53C25.104 15.17 25.354 13.67 25.354 12.03C25.354 9.13 24.494 6.89 22.774 5.31C21.054 3.73 18.824 2.94 16.084 2.94H12.924V20.85ZM0.23 20.85H11.51L6.87 3.23H1.47L0.23 20.85Z" fill="#635BFF"/>
    </svg>
);

const PayPalLogo = () => (
    <Image src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.png" alt="PayPal" width={80} height={50} data-ai-hint="PayPal logo" />
);

export function SuscripcionSettings() {
    const { user } = useContext(AuthContext);

    const planDetails = {
        free: { name: 'Gratis', price: '0€', interval: '/mes', renewal: 'Tu plan es gratuito y no se renueva.' },
        pro: { name: 'Pro', price: '4.95€', interval: '/mes', renewal: 'Tu plan se renueva el 15 de Agosto, 2024.' },
        empresa: { name: 'Empresa', price: '29€', interval: '/mes', renewal: 'Tu plan se renueva el 15 de Agosto, 2024.' },
        admin: { name: 'Admin', price: 'N/A', interval: '', renewal: 'Tienes acceso de administrador.' }
    };

    const currentPlan = user?.role ? planDetails[user.role] : planDetails['free'];


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
                <Badge color="accent" className="mb-2 bg-accent text-accent-foreground">{currentPlan.name}</Badge>
                <p className="text-2xl font-bold">{currentPlan.price}<span className="text-base font-normal text-muted-foreground">{currentPlan.interval}</span></p>
                <p className="text-sm text-muted-foreground">{currentPlan.renewal}</p>
              </div>
              {user?.role !== 'admin' && (
                <Button asChild>
                    <Link href="/#pricing">Cambiar de Plan</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Separator />
        
        {/* Payment Method Section */}
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Método de Pago</h3>
            {user?.role === 'free' ? (
                <p className="text-sm text-muted-foreground">No se requiere un método de pago para el plan gratuito.</p>
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
             {user?.role === 'free' ? (
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
  );
}
