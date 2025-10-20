
'use client';

import { useState, useContext } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Clock, PlusCircle } from 'lucide-react';
import { ListadoEmpleadosTab } from './listado-empleados-tab';
import { FichajesTab } from './fichajes-tab';
import { Button } from '@/components/ui/button';
import AddEmployeeModal from '../nominas/add-employee-modal';
import { AuthContext } from '@/context/auth-context';

export type Employee = {
    id: string;
    ownerId: string;
    name: string;
    email: string;
    position: string;
    nif: string;
    socialSecurityNumber: string;
    contractType: 'Indefinido' | 'Temporal' | 'Formación' | 'Prácticas';
    grossAnnualSalary: number;
};

export function EmpleadosPageContent() {
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const { user, isEmpresa } = useContext(AuthContext);

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
                        <ListadoEmpleadosTab />
                    </TabsContent>
                    <TabsContent value="fichajes"  className="mt-6">
                        <FichajesTab />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
