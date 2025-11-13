

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Employee } from '../types';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EditEmployeeForm } from './edit-employee-form';

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employeeId) {
      router.push('/dashboard/finanzas?tab=empleados');
      return;
    }

    const docRef = doc(db, 'employees', employeeId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setEmployee({ id: docSnap.id, ...docSnap.data() } as Employee);
      } else {
        // Handle case where employee is not found
        router.push('/dashboard/finanzas?tab=empleados');
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching employee details:", error);
        router.push('/dashboard/finanzas?tab=empleados');
    });

    return () => unsubscribe();
  }, [employeeId, router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!employee) {
    return (
        <div className="text-center">
            <p>Empleado no encontrado.</p>
             <Button onClick={() => router.push('/dashboard/finanzas?tab=empleados')} className="mt-4">
                Volver
             </Button>
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/finanzas?tab=empleados')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Empleado</h1>
            <p className="text-muted-foreground">Modificando los detalles de {employee.name}.</p>
          </div>
        </div>

        <Card>
            <CardContent className="pt-6">
                <EditEmployeeForm employee={employee} onClose={() => router.push('/dashboard/finanzas?tab=empleados')} />
            </CardContent>
        </Card>
    </div>
  )
}

    