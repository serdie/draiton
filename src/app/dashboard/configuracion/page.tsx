
'use client';

import { Suspense, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerfilSettings } from "./perfil-settings";
import { EmpresaSettings } from "./empresa-settings";
import { NotificacionesSettings } from "./notificaciones-settings";
import { AparienciaSettings } from "./apariencia-settings";
import { SuscripcionSettings } from "./suscripcion-settings";
import { User, Building, Bell, Palette, CreditCard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { AuthContext } from '@/context/auth-context';

function ConfiguracionContent() {
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'perfil';
  const { isEmployee } = useContext(AuthContext);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Personaliza tu perfil, los datos de tu empresa y la apariencia de la aplicación.
        </p>
      </div>
      <Tabs defaultValue={tab} orientation={isMobile ? 'vertical' : 'horizontal'} className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="perfil" className="w-full justify-start md:justify-center">
            <User className="mr-2 h-4 w-4" />
            Perfil
          </TabsTrigger>
          {!isEmployee && (
            <TabsTrigger value="empresa" className="w-full justify-start md:justify-center">
                <Building className="mr-2 h-4 w-4" />
                Empresa
            </TabsTrigger>
          )}
          <TabsTrigger value="suscripcion" className="w-full justify-start md:justify-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Suscripción
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="w-full justify-start md:justify-center">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </TabsTrigger>
           <TabsTrigger value="apariencia" className="w-full justify-start md:justify-center">
            <Palette className="mr-2 h-4 w-4" />
            Apariencia
          </TabsTrigger>
        </TabsList>
        <div className="mt-6 md:mt-0 md:pl-4 w-full">
            <TabsContent value="perfil"><PerfilSettings /></TabsContent>
            {!isEmployee && (
                <TabsContent value="empresa"><EmpresaSettings /></TabsContent>
            )}
            <TabsContent value="suscripcion"><SuscripcionSettings /></TabsContent>
            <TabsContent value="notificaciones"><NotificacionesSettings /></TabsContent>
            <TabsContent value="apariencia"><AparienciaSettings /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default function ConfiguracionPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ConfiguracionContent />
        </Suspense>
    )
}
