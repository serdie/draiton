
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Eye, Loader2 } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '@/context/auth-context';
import Image from 'next/image';
import { ViewDocumentModal } from '../documentos/view-document-modal';
import type { Document } from '../documentos/page';

// Datos de ejemplo para el historial (se verán hasta que uses la API real de facturas)
const billingHistory = [
    { id: 'INV-2024-003', date: '15 de Julio, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
    { id: 'INV-2024-002', date: '15 de Junio, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
    { id: 'INV-2024-001', date: '15 de Mayo, 2024', description: 'Suscripción Plan Pro', amount: '4.95€' },
];

const StripeLogo = () => (
    <Image src="https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/Stripe%20wordmark%20-%20Blurple%20-%20Large.png?alt=media&token=26ab483a-3f39-428a-9a3b-e257fea86f32" alt="Stripe" width={100} height={40} className="object-contain" />
);

const PayPalLogo = () => (
    <Image src="https://www.paypalobjects.com/webstatic/mktg/logo-center/logotipo_paypal_pagos.png" alt="PayPal" width={111} height={69} />
);

export function SuscripcionSettings() {
    // 🛠️ TRUCO: Renombramos a 'authUser' y lo convertimos a 'any'
    // Esto hace que TypeScript deje de quejarse por los campos nuevos (planPrice, etc.)
    const { user: authUser } = useContext(AuthContext);
    const user = authUser as any; 

    const [invoiceToView, setInvoiceToView] = useState<Document | null>(null);
    const [loadingPortal, setLoadingPortal] = useState(false);

    // --- LÓGICA DE DATOS REALES ---
    // 1. Texto de renovación dinámico
    let renewalText = 'Tu plan no se renueva automáticamente.';
    
    // Ahora TypeScript no se quejará de currentPeriodEnd
    if (user?.currentPeriodEnd) {
        // Firebase Timestamp a fecha legible
        const date = new Date(user.currentPeriodEnd.seconds * 1000);
        renewalText = `Tu plan se renueva el ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
    }

    // 2. Precios y nombres reales desde la base de datos
    const displayPrice = user?.planPrice ? `${user.planPrice}€` : '0€';
    const displayInterval = user?.planInterval === 'year' ? '/año' : '/mes';
    // Ponemos la primera letra en mayúscula (pro -> Pro)
    const displayRoleName = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Gratis';

    // --- FUNCIÓN PARA ABRIR PORTAL STRIPE ---
    const handlePortal = async () => {
        setLoadingPortal(true);
        try {
            const res = await fetch('/api/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.uid }),
            });
            const data = await res.json();
            
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Error: ' + (data.error || 'No pudimos abrir el portal de facturación'));
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión con el servidor');
        } finally {
            setLoadingPortal(false);
        }
    };

    // --- FUNCIÓN PARA VER FACTURA (POPUP) ---
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

        {/* --- SECCIÓN PLAN ACTUAL --- */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg">Tu Plan Actual</h3>
          <Card className="bg-muted/50">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <Badge className="mb-2 bg-primary text-primary-foreground">
                    {displayRoleName}
                </Badge>
                <p className="text-2xl font-bold">
                    {displayPrice}
                    <span className="text-base font-normal text-muted-foreground">{displayInterval}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                    {renewalText}
                </p>
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
        
        {/* --- MÉTODOS DE PAGO --- */}
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Método de Pago</h3>
            {user?.role === 'free' || user?.role === 'employee' ? (
                <p className="text-sm text-muted-foreground">No tienes métodos de pago guardados.</p>
            ) : (
                <div className="space-y-4">
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <StripeLogo />
                                <div>
                                    <p className="font-medium">Tarjeta vinculada</p>
                                    <p className="text-sm text-muted-foreground">Gestionada de forma segura por Stripe</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={handlePortal} disabled={loadingPortal}>
                                {loadingPortal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Gestionar en Stripe'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
        
      </CardContent>
    </Card>
    </>
  );
}
