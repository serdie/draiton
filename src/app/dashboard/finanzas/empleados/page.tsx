
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Clock } from 'lucide-react';
import { ListadoEmpleadosTab } from './listado-empleados-tab';
import { FichajesTab } from './fichajes-tab';

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
    return (
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
    )
}

