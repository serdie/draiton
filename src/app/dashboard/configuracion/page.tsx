
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerfilSettings } from "./perfil-settings";
import { EmpresaSettings } from "./empresa-settings";
import { NotificacionesSettings } from "./notificaciones-settings";
import { AparienciaSettings } from "./apariencia-settings";
import { User, Building, Bell, Palette } from "lucide-react";

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Personaliza tu perfil, los datos de tu empresa y la apariencia de la aplicación.
        </p>
      </div>
      <Tabs defaultValue="perfil" className="flex flex-col md:flex-row gap-8">
        <TabsList className="flex-col h-auto justify-start items-stretch w-full md:w-48">
          <TabsTrigger value="perfil" className="justify-start gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="empresa" className="justify-start gap-2">
            <Building className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="justify-start gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
           <TabsTrigger value="apariencia" className="justify-start gap-2">
            <Palette className="h-4 w-4" />
            Apariencia
          </TabsTrigger>
        </TabsList>
        <div className="flex-1">
            <TabsContent value="perfil"><PerfilSettings /></TabsContent>
            <TabsContent value="empresa"><EmpresaSettings /></TabsContent>
            <TabsContent value="notificaciones"><NotificacionesSettings /></TabsContent>
            <TabsContent value="apariencia"><AparienciaSettings /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
