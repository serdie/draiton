
'use client';

import { useContext } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Coins, Receipt, Users, Clock } from 'lucide-react';
import { DocumentosContent } from '../documentos/documentos-content';
import { GastosContent } from '../gastos/gastos-content';
import { ImpuestosTab } from './impuestos-tab';
import { AuthContext } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { EmployeePayslipList } from './empleados/employee-payslip-list';
import { FichajesTab } from './empleados/fichajes-tab';
import { NominasTab } from './nominas-tab';

export default function FinanzasPage() {
  const { user, isEmpresa, isEmployee } = useContext(AuthContext);

  if (isEmployee) {
    // This view is for employees, showing only their payslips.
    // The main entry for employee clocking-in is under 'Operaciones'.
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Nóminas</h1>
          <p className="text-muted-foreground">Consulta tu historial de nóminas recibidas.</p>
        </div>
        {user && <EmployeePayslipList employee={{id: user.uid, name: user.displayName || 'Empleado', ...user} as any} />}
      </div>
    );
  }

  // Vista para dueños de empresa, pro y admin
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión Financiera</h1>
          <p className="text-muted-foreground">Controla tus facturas, gastos, impuestos y empleados en un solo lugar.</p>
        </div>

        <Tabs defaultValue="documentos" className="w-full">
          <TabsList className={cn("grid w-full", isEmpresa ? "grid-cols-5" : "grid-cols-3")}>
            <TabsTrigger value="documentos"><FileText className="mr-2 h-4 w-4" />Documentos</TabsTrigger>
            <TabsTrigger value="gastos"><Receipt className="mr-2 h-4 w-4" />Gastos</TabsTrigger>
            <TabsTrigger value="impuestos"><Coins className="mr-2 h-4 w-4" />Impuestos</TabsTrigger>
            {isEmpresa && <TabsTrigger value="nominas"><Users className="mr-2 h-4 w-4" />Nóminas</TabsTrigger>}
            {isEmpresa && <TabsTrigger value="fichajes"><Clock className="mr-2 h-4 w-4" />Fichajes</TabsTrigger>}
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
            <TabsContent value="nominas"  className="mt-6">
              <NominasTab />
            </TabsContent>
          )}
          {isEmpresa && (
             <TabsContent value="fichajes"  className="mt-6">
              <FichajesTab />
            </TabsContent>
          )}
        </Tabs>
      </div>
  );
}
