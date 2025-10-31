
'use client';

import { useContext, useEffect, useState } from 'react';
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
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Employee } from './empleados/types';
import { FichajesTab } from './empleados/fichajes-tab';

export default function FinanzasPage() {
  const { user, isEmpresa, isEmployee } = useContext(AuthContext);
  const [employeeProfile, setEmployeeProfile] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isEmployee && user?.uid) {
        const fetchEmployeeProfile = async () => {
            const employeesQuery = query(collection(db, 'employees'), where('__name__', '==', user.uid));
            try {
                const snapshot = await getDocs(employeesQuery);
                if (!snapshot.empty) {
                    const employeeData = snapshot.docs[0].data();
                    setEmployeeProfile({
                        id: snapshot.docs[0].id,
                        ...employeeData
                    } as Employee);
                }
            } catch (error) {
                console.error("Error fetching employee profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployeeProfile();
    } else {
        setLoading(false);
    }
  }, [isEmployee, user?.uid]);


  if (isEmployee) {
    if (loading) {
        return (
            <div className="flex h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!employeeProfile) {
         return <div className="text-center text-muted-foreground p-8">No se pudo cargar el perfil del empleado.</div>
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Finanzas</h1>
          <p className="text-muted-foreground">Consulta tus nóminas.</p>
        </div>
        <Tabs defaultValue="nominas" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="nominas">
              <FileText className="mr-2 h-4 w-4" />
              Mis Nóminas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="nominas" className="mt-6">
            <EmployeePayslipList employee={employeeProfile} />
          </TabsContent>
        </Tabs>
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
          <TabsList className={cn("grid w-full", isEmpresa ? "grid-cols-5" : "grid-cols-4")}>
            <TabsTrigger value="documentos"><FileText className="mr-2 h-4 w-4" />Documentos</TabsTrigger>
            <TabsTrigger value="gastos"><Receipt className="mr-2 h-4 w-4" />Gastos</TabsTrigger>
            <TabsTrigger value="impuestos"><Coins className="mr-2 h-4 w-4" />Impuestos</TabsTrigger>
             <TabsTrigger value="empleados"><Users className="mr-2 h-4 w-4" />Empleados</TabsTrigger>
            {isEmpresa && (
                 <TabsTrigger value="fichajes"><Clock className="mr-2 h-4 w-4" />Control Horario</TabsTrigger>
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
          <TabsContent value="empleados"  className="mt-6">
              <EmpleadosPageContent />
          </TabsContent>
           {isEmpresa && (
                <TabsContent value="fichajes"  className="mt-6">
                    <FichajesTab />
                </TabsContent>
           )}
        </Tabs>
      </div>
  );
}
