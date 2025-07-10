import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  FilePlus,
  Landmark,
  Plus,
  TrendingUp,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Panel de Control
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de la actividad de tu negocio.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">
              Resumen Financiero
            </CardTitle>
            <Landmark className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="flex justify-around gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ingresos (Pagados)</p>
              <p className="text-2xl font-bold">€0.00</p>
              <p className="text-xs text-muted-foreground">Este Mes (Demo)</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Gastos</p>
              <p className="text-2xl font-bold">€0.00</p>
              <p className="text-xs text-muted-foreground">Este Mes (Demo)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">
              Proyectos Activos
            </CardTitle>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Proyectos en curso (Demo)</p>
            </div>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/proyectos">Ver Proyectos</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-medium">
              Perspectivas con IA
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Obtén sugerencias de IA para tu negocio.
            </p>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/perspectivas-ia">Explorar Perspectivas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/dashboard/facturacion">
              <FilePlus />
              Crear Factura
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/contactos">
              <UserPlus />
              Añadir Cliente
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/gastos">
              <Landmark />
              Registrar Gasto
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/proyectos">
              <Plus />
              Nuevo Proyecto
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Actividad Reciente</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-6">
                    <p>Aún no hay actividad reciente.</p>
                     <Button variant="link" asChild className="mt-2">
                        <Link href="#">Ver toda la actividad</Link>
                    </Button>
                </div>
            </CardContent>
         </Card>
         <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-200 h-full">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
            <AlertTitle>Alertas Importantes</AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-300">
                No hay alertas críticas por el momento.
            </AlertDescription>
         </Alert>
      </div>
    </div>
  );
}
