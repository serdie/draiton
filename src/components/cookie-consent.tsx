'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'draiton-cookie-consent';
const COOKIE_EXPIRATION_DAYS = 365;

type ConsentValue = 'accepted' | 'rejected' | 'unset';
type AnalyticsConsent = 'granted' | 'denied';

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue>('unset');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  useEffect(() => {
    try {
      const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (storedConsent) {
        const { value, expiry } = JSON.parse(storedConsent);
        if (new Date(expiry) > new Date()) {
          setConsent(value);
          setAnalyticsAllowed(value === 'accepted' || JSON.parse(localStorage.getItem('draiton-analytics-consent') || 'false'));
        } else {
          localStorage.removeItem(COOKIE_CONSENT_KEY);
          localStorage.removeItem('draiton-analytics-consent');
          setConsent('unset');
        }
      } else {
        setConsent('unset');
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
      setConsent('unset');
    }
  }, []);

  useEffect(() => {
    // This function would interact with Google Tag Manager or your analytics script
    const updateGtagConsent = (value: AnalyticsConsent) => {
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                'analytics_storage': value
            });
        }
    }

    if (consent === 'accepted' || analyticsAllowed) {
        updateGtagConsent('granted');
    } else if (consent === 'rejected' || !analyticsAllowed) {
        updateGtagConsent('denied');
    }
  }, [consent, analyticsAllowed]);

  const setCookieConsent = (value: ConsentValue, allowAnalytics: boolean) => {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + COOKIE_EXPIRATION_DAYS);
    const consentData = { value, expiry: expiry.toISOString() };
    
    try {
        localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consentData));
        localStorage.setItem('draiton-analytics-consent', JSON.stringify(allowAnalytics));
        setConsent(value);
        setAnalyticsAllowed(allowAnalytics);
        setIsConfigOpen(false);
    } catch (error) {
        console.error("Error writing to localStorage", error);
    }
  };

  const handleAcceptAll = () => {
    setCookieConsent('accepted', true);
  };

  const handleRejectAll = () => {
    setCookieConsent('rejected', false);
  };

  const handleSavePreferences = () => {
    setCookieConsent(analyticsAllowed ? 'accepted' : 'rejected', analyticsAllowed);
  };

  if (consent !== 'unset') {
    return null;
  }

  return (
    <>
      {/* --- BANNER (CAPA 1) --- */}
      <div className="fixed inset-x-0 bottom-0 z-50 p-4">
        <Card className="max-w-4xl mx-auto shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-6 w-6 text-primary" />
              Cookies y Privacidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              En Draiton utilizamos cookies propias y de terceros para garantizar que la app funcione correctamente, recordar tus preferencias y, si nos das permiso, analizar cómo utilizas nuestra plataforma para mejorar nuestros servicios.
              Puedes aceptar todas, rechazarlas o configurar tus preferencias a continuación. Para más información, consulta nuestra{' '}
              <Link href="/politica-de-cookies" className="underline hover:text-primary">
                Política de Cookies
              </Link>.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button className="w-full sm:w-auto" onClick={handleAcceptAll}>Aceptar Todas</Button>
            <Button className="w-full sm:w-auto" variant="secondary" onClick={handleRejectAll}>Rechazar Todas</Button>
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => setIsConfigOpen(true)}>Configurar</Button>
          </CardFooter>
        </Card>
      </div>

      {/* --- MODAL CONFIGURACIÓN (CAPA 2) --- */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración de privacidad</DialogTitle>
            <DialogDescription>
              Tú decides qué cookies permites. Tu elección se guardará durante un año.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
              <div>
                <Label htmlFor="technical-cookies" className="font-semibold">Cookies Técnicas (Necesarias)</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Son imprescindibles para que la app funcione (inicio de sesión, seguridad, etc.). No se pueden desactivar.
                </p>
              </div>
              <Switch id="technical-cookies" checked disabled />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="analytics-cookies" className="font-semibold">Cookies de Análisis</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Nos ayudan a entender qué partes de la app usas más. La información es anónima (Google Analytics).
                </p>
              </div>
              <Switch
                id="analytics-cookies"
                checked={analyticsAllowed}
                onCheckedChange={setAnalyticsAllowed}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSavePreferences} className="w-full">Guardar mis preferencias</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
