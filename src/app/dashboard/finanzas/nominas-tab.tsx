
'use client';

import { useState, useContext, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { AddEmployeeModal } from './nominas/add-employee-modal';
import { ListadoEmpleadosTab } from './empleados/listado-empleados-tab';
import { AuthContext } from '@/context/auth-context';
import type { Employee } from './empleados/types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';

export function NominasTab() {
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const { user, isEmpresa } = useContext(AuthContext);
    const { toast } = useToast();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    
    const employeeLimit = 5;
    const canAddEmployee = isEmpresa ? employees.length < employeeLimit : user?.role === 'admin';

     useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(db, 'employees'), where('ownerId', '==', user.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEmployees = snapshot.docs.map(docSnap => {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                } as Employee;
            });
            setEmployees(fetchedEmployees);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching employees:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los empleados.'});
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);

    return (
        <>
            <AddEmployeeModal
                isOpen={isAddEmployeeModalOpen}
                onClose={() => setIsAddEmployeeModalOpen(false)}
                onEmployeeAdded={() => { /* Could trigger a refetch if needed */ }}
            />
             <div className="space-y-6">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Gestión de Empleados y Nóminas</h2>
                        <p className="text-muted-foreground">
                            Añade a tus empleados y genera sus nóminas con la ayuda de la IA.
                        </p>
                    </div>
                     <div className="flex flex-col items-end">
                        <Button onClick={() => setIsAddEmployeeModalOpen(true)} disabled={!canAddEmployee}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Añadir Empleado
                        </Button>
                        {isEmpresa && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {employees.length}/{employeeLimit} empleados creados.
                            </p>
                        )}
                    </div>
                </div>
                <ListadoEmpleadosTab 
                    employees={employees}
                    loading={loading}
                />
            </div>
        </>
    )
}
