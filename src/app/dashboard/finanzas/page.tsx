
'use client';

import { useState, useContext } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Coins, Receipt, FileSignature } from 'lucide-react';
import { DocumentosContent } from '../documentos/documentos-content';
import { GastosContent } from '../gastos/gastos-content';
import { ImpuestosTab } from './impuestos-tab';
import { AuthContext } from '@/context/auth-context';
import { cn } from '@/lib/utils';


const ComingSoon = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 bg-secondary/30 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p>Esta sección estará disponible próximamente.</p>
    </div>
);

export default function FinanzasPage() {
  const { isEmpresa } = useContext(AuthContext);
  
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
                 <TabsTrigger value="nominas"><FileSignature className="mr-2 h-4 w-4" />Nóminas</TabsTrigger>
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
                <TabsContent value="nominas"  className="mt-6">
                    <ComingSoon title="Gestión de Nóminas" />
                </TabsContent>
           )}
        </Tabs>
      </div>
  );
}
