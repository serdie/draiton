
'use client';

import { useState, useContext, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Clock, PlusCircle } from 'lucide-react';
import { ListadoEmpleadosTab } from './listado-empleados-tab';
import { FichajesTab } from './fichajes-tab';
import { Button } from '@/components/ui/button';
import { AddEmployeeModal } from '../nominas/add-employee-modal';
import { EditEmployeeModal } from './edit-employee-modal';
import { AuthContext } from '@/context/auth-context';
import type { Employee } from './types';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';


export function EmpleadosPageContent() {
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
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
            {employeeToEdit && (
                 <EditEmployeeModal
                    isOpen={!!employeeToEdit}
                    onClose={() => setEmployeeToEdit(null)}
                    employee={employeeToEdit}
                />
            )}
            <div className="space-y-6">
                 <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Gestión de Empleados</h2>
                        <p className="text-muted-foreground">
                            Añade a tus empleados, gestiona sus nóminas y controla su jornada laboral.
                        </p>
                    </div>
                     <Button onClick={() => setIsAddEmployeeModalOpen(true)} disabled={!isEmpresa && user?.role !== 'admin'}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Empleado
                    </Button>
                </div>
                <Tabs defaultValue="listado" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="listado"><List className="mr-2 h-4 w-4" />Listado de Empleados</TabsTrigger>
                        <TabsTrigger value="fichajes"><Clock className="mr-2 h-4 w-4" />Control Horario</TabsTrigger>
                    </TabsList>
                    <TabsContent value="listado" className="mt-6">
                        <ListadoEmpleadosTab 
                            onEditEmployee={setEmployeeToEdit}
                            employees={employees}
                            loading={loading}
                        />
                    </TabsContent>
                    <TabsContent value="fichajes"  className="mt-6">
                        <FichajesTab />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
