
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Coins, Landmark, Receipt } from 'lucide-react';
import { DocumentosContent } from '../documentos/documentos-content';
import { GastosContent } from '../gastos/gastos-content';
import { ImpuestosTab } from './impuestos-tab';


const ComingSoon = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8 bg-secondary/30 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p>Esta sección estará disponible próximamente.</p>
    </div>
);

export default function FinanzasPage() {
  
  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión Financiera</h1>
          <p className="text-muted-foreground">Controla tus facturas, gastos e impuestos en un solo lugar.</p>
        </div>

        <Tabs defaultValue="documentos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documentos"><FileText className="mr-2 h-4 w-4" />Documentos</TabsTrigger>
            <TabsTrigger value="gastos"><Receipt className="mr-2 h-4 w-4" />Gastos</TabsTrigger>
            <TabsTrigger value="impuestos"><Coins className="mr-2 h-4 w-4" />Impuestos</TabsTrigger>
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
        </Tabs>
      </div>
  );
}
