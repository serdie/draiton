
'use client';

import { useContext } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Coins, Receipt, Users, Loader2, Clock } from 'lucide-react';
import { DocumentosContent } from '../documentos/documentos-content';
import { GastosContent } from '../gastos/gastos-content';
import { ImpuestosTab } from './impuestos-tab';
import { AuthContext } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { EmpleadosPageContent } from './empleados/page';
import { EmployeePayslipList } from './empleados/employee-payslip-list';
import { FichajeEmpleadoTab } from './empleados/fichaje-empleado-tab';

export default function FinanzasPage() {
  const { user, isEmpresa, isEmployee } = useContext(AuthContext);

  if (isEmployee) {
    // Renderiza la vista del empleado solo si el user.uid está disponible para evitar errores de consulta.
    if (user?.uid) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Mis Finanzas y Fichajes</h1>
                    <p className="text-muted-foreground">Consulta tus nóminas y gestiona tu jornada laboral.</p>
                </div>
                 <Tabs defaultValue="fichajes" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="fichajes"><Clock className="mr-2 h-4 w-4"/>Mi Fichaje</TabsTrigger>
                        <TabsTrigger value="nominas"><FileText className="mr-2 h-4 w-4"/>Mis Nóminas</TabsTrigger>
                    </TabsList>
                    <TabsContent value="fichajes" className="mt-6">
                        <FichajeEmpleadoTab employee={user as any} />
                    </TabsContent>
                    <TabsContent value="nominas" className="mt-6">
                         <EmployeePayslipList employee={user as any} />
                    </TabsContent>
                </Tabs>
            </div>
        );
    }
    // Muestra un cargador mientras se obtiene la información completa del usuario.
    return (
       <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  // Vista para dueños de empresa, pro y admin
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión Financiera</h1>
          <p className="text-muted-foreground">Controla tus facturas, gastos e impuestos en un solo lugar.</p>
        </div>

        <Tabs defaultValue="documentos" className="w-full">
          <TabsList className={cn("grid w-full", isEmpresa ? "grid-cols-4" : "grid-cols-3")}>
            <TabsTrigger value="documentos"><FileText className="mr-2 h-4 w-4" />Documentos</TabsTrigger>
            <TabsTrigger value="gastos"><Receipt className="mr-2 h-4 w-4" />Gastos</TabsTrigger>
            <TabsTrigger value="impuestos"><Coins className="mr-2 h-4 w-4" />Impuestos</TabsTrigger>
            {isEmpresa && (
                 <TabsTrigger value="empleados"><Users className="mr-2 h-4 w-4" />Empleados</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="documentos" className="mt-6">
            <DocumentosContent />
          </TabsContent>
          <TabsContent value="gastos"  className="mt-6">
            <GastosContent />
          </TabsContent>
          <TabsContent value="impuestos"  className="mt-6">
            <ImpuestosTab />
          </TabsContent>
           {isEmpresa && (
                <TabsContent value="empleados"  className="mt-6">
                    <EmpleadosPageContent />
                </TabsContent>
           )}
        </Tabs>
      </div>
  );
}
