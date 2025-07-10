import {
  Activity,
  ArrowRight,
  Briefcase,
  FileText,
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
  CardFooter
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import Link from 'next/link';

const recentActivities = [
    { user: 'Alicia Maravillas', action: 'ha pagado la factura FACT-2023-001.' },
    { user: 'Tú', action: 'has añadido un nuevo gasto de 150.00€.' },
    { user: 'Tú', action: 'has completado el proyecto \'Consultoría SEO\'.' },
    { user: 'Laura Prospecto', action: 'ha sido añadida como nuevo Lead.' },
];


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
              <p className="text-2xl font-bold text-green-600">€1,452.61</p>
              <p className="text-xs text-muted-foreground">Este Mes</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Gastos</p>
              <p className="text-2xl font-bold text-red-600">€403.49</p>
              <p className="text-xs text-muted-foreground">Este Mes</p>
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
                <p className="text-3xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Proyectos en curso</p>
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

      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">Actividad Reciente</CardTitle>
                <Activity className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={activity.user === 'Tú' ? '/user-avatar.png' : '/other-avatar.png'} alt="Avatar" />
                       <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{activity.user}</span> {activity.action}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
             <CardFooter>
              <Button variant="link" asChild className="w-full">
                <Link href="#">Ver toda la actividad <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardFooter>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
                <CardDescription>Accede a las funciones más comunes.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button asChild>
                <Link href="/dashboard/documentos">
                  <FileText className="mr-2" />
                  Crear Factura
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/contactos">
                  <UserPlus className="mr-2" />
                  Añadir Contacto
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/gastos">
                  <Landmark className="mr-2" />
                  Registrar Gasto
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/dashboard/proyectos">
                  <Plus className="mr-2" />
                  Nuevo Proyecto
                </Link>
              </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
