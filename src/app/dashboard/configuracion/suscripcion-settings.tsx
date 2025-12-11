
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '@/context/auth-context';
import Image from 'next/image';

const StripeLogo = () => (
    <Image src="https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/Stripe%20wordmark%20-%20Blurple%20-%20Large.png?alt=media&token=26ab483a-3f39-428a-9a3b-e257fea86f32" alt="Stripe" width={100} height={40} className="object-contain" />
);

export function SuscripcionSettings() {
    const { user: authUser } = useContext(AuthContext);
    const user = authUser as any; 

    const [loadingPortal, setLoadingPortal] = useState(false);

    // --- LÓGICA DE DATOS REALES ---
    let renewalText = 'Tu plan no se renueva automáticamente.';
    
    if (user?.currentPeriodEnd) {
        const date = new Date(user.currentPeriodEnd.seconds * 1000);
        renewalText = `Tu plan se renueva el ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.`;
    }

    const displayPrice = user?.planPrice ? `${user.planPrice.toLocaleString('es-ES')}€` : '0€';
    const displayInterval = user?.planInterval === 'year' ? '/año' : '/mes';
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

  return (
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
  );
}
