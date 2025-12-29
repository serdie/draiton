
'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, PencilRuler, Settings } from 'lucide-react';
import { UsersTab } from "./users-tab";
import { AnalyticsTab } from "./analytics-tab";
import { ContentTab } from "./content-tab";
import { AppSettingsTab } from "./app-settings-tab";

export default function AdminDashboardPage() {
    const { user, loading } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || user.role !== 'admin')) {
        router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (user?.role !== 'admin') {
         return (
            <div className="flex h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <ShieldAlert className="h-6 w-6 text-destructive" />
                            Acceso Denegado
                        </CardTitle>
                        <CardDescription>
                            No tienes permisos para acceder a esta sección.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            El panel de administración es exclusivo para usuarios con rol de administrador.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/dashboard">Volver al Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                 <div>
                    <h1 className="text-3xl font-bold">Panel de Administración</h1>
                    <p className="text-muted-foreground">
                        Control total sobre la aplicación, usuarios y contenido.
                    </p>
                </div>
                 <Button asChild variant="outline">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Regresar a la aplicación
                    </Link>
                </Button>
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
