
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Employee } from '@/app/dashboard/finanzas/empleados/types';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

export default function EmployeePortalPage() {
  const params = useParams();
  const portalId = params?.portalId as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portalId) {
      setError('ID de portal no válido.');
      setLoading(false);
      return;
    }

    const employeesQuery = query(collection(db, 'employees'), where('employeePortalId', '==', portalId));

    const unsubscribe = onSnapshot(employeesQuery, (querySnapshot) => {
      if (querySnapshot.empty) {
        setError('No se encontró ningún empleado para este portal o no está activado.');
        setLoading(false);
        return;
      }
      
      const employeeDoc = querySnapshot.docs[0];
      const employeeData = employeeDoc.data() as Employee;

      if (!employeeData.employeePortalActive) {
          setError('El portal para este empleado no está activo.');
          setLoading(false);
          return;
      }

      setEmployee({
          id: employeeDoc.id,
          ...employeeData,
          hireDate: employeeData.hireDate ? (employeeData.hireDate as any).toDate() : undefined,
      });

      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('Error al cargar los datos del empleado.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [portalId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Cargando portal del empleado...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-center">
         <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="text-destructive">Acceso Restringido</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
         </Card>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="min-h-screen bg-muted/40">
        <header className="bg-background border-b">
            <div className="container mx-auto flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <Logo className="h-6 w-6"/>
                    <span className="font-bold">Portal del Empleado</span>
                </div>
            </div>
        </header>

        <main className="container mx-auto py-8">
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={employee.avatar} />
                                <AvatarFallback className="text-xl">
                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">Bienvenido, {employee.name}</CardTitle>
                                <CardDescription>Este es tu espacio personal para consultar tu información laboral.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-muted-foreground">Puesto</p><p className="font-semibold">{employee.position}</p></div>
                        <div><p className="text-muted-foreground">Contrato</p><p className="font-semibold">{employee.contractType}</p></div>
                        <div><p className="text-muted-foreground">NIF</p><p className="font-semibold">{employee.nif}</p></div>
                        <div><p className="text-muted-foreground">Nº S.S.</p><p className="font-semibold">{employee.socialSecurityNumber}</p></div>
                    </CardContent>
                </Card>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Mis Nóminas</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Aquí aparecerá un listado de tus nóminas para que puedas consultarlas y descargarlas.</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-primary"/> Mis Fichajes</CardTitle></CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">Consulta tu historial de entradas y salidas. Próximamente podrás fichar desde aquí.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    </div>
  );
}
