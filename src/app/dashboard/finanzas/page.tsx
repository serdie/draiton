
'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Coins, Receipt, Users, Loader2 } from 'lucide-react';
import { DocumentosContent } from '../documentos/documentos-content';
import { GastosContent } from '../gastos/gastos-content';
import { ImpuestosTab } from './impuestos-tab';
import { AuthContext } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { EmpleadosPageContent } from './empleados/page';
import { EmployeePayslipList } from './empleados/employee-payslip-list';
import { FichajeEmpleadoTab } from './empleados/fichaje-empleado-tab';
import { Clock } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { type Employee } from './empleados/types';


export default function FinanzasPage() {
  const { user, isEmpresa, isEmployee } = useContext(AuthContext);
  const [employeeProfile, setEmployeeProfile] = useState<Employee | null>(null);
  const [loadingEmployee, setLoadingEmployee] = useState(true);

  const getEmployeeProfile = useCallback(async (uid: string) => {
    setLoadingEmployee(true);
    try {
        const employeeDocRef = doc(db, 'employees', uid);
        const docSnap = await getDoc(employeeDocRef);
        if (docSnap.exists()) {
            setEmployeeProfile({ id: docSnap.id, ...docSnap.data() } as Employee);
        }
    } catch (error) {
        console.error("Error fetching employee profile:", error);
    } finally {
        setLoadingEmployee(false);
    }
  }, []);

  useEffect(() => {
    if (isEmployee) {
      if (user?.uid && !employeeProfile) {
        getEmployeeProfile(user.uid);
      }
    } else {
      setLoadingEmployee(false);
    }
  }, [isEmployee, user?.uid, employeeProfile, getEmployeeProfile]);


  if (isEmployee) {
    if (loadingEmployee) {
       return (
        <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
       );
    }
    
    if (employeeProfile) {
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
                        <FichajeEmpleadoTab employee={employeeProfile} />
                    </TabsContent>
                    <TabsContent value="nominas" className="mt-6">
                         <EmployeePayslipList employee={employeeProfile} />
                    </TabsContent>
                </Tabs>
            </div>
        )
    }
     return <div>No se pudo cargar el perfil del empleado.</div>;
  }

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
