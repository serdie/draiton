
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, PencilRuler, Settings } from 'lucide-react';
import { UsersTab } from "./users-tab";
import { AnalyticsTab } from "./analytics-tab";
import { ContentTab } from "./content-tab";
import { AppSettingsTab } from "./app-settings-tab";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Panel de Administración</h1>
                <p className="text-muted-foreground">
                    Control total sobre la aplicación, usuarios y contenido.
                </p>
            </div>

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="users">
                        <Users className="mr-2 h-4 w-4" />
                        Gestión de Usuarios
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analíticas
                    </TabsTrigger>
                    <TabsTrigger value="content">
                        <PencilRuler className="mr-2 h-4 w-4" />
                        Gestión de Contenido
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Configuración App
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="users">
                        <UsersTab />
                    </TabsContent>
                    <TabsContent value="analytics">
                        <AnalyticsTab />
                    </TabsContent>
                    <TabsContent value="content">
                        <ContentTab />
                    </TabsContent>
                     <TabsContent value="settings">
                        <AppSettingsTab />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
