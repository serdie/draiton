
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
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="perfil">
            <User className="mr-2 h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="empresa">
            <Building className="mr-2 h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="notificaciones">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </TabsTrigger>
           <TabsTrigger value="apariencia">
            <Palette className="mr-2 h-4 w-4" />
            Apariencia
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
            <TabsContent value="perfil"><PerfilSettings /></TabsContent>
            <TabsContent value="empresa"><EmpresaSettings /></TabsContent>
            <TabsContent value="notificaciones"><NotificacionesSettings /></TabsContent>
            <TabsContent value="apariencia"><AparienciaSettings /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
