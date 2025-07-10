'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileUp, FilePlus, MoreHorizontal } from 'lucide-react';
import { ImportInvoiceModal } from './import-invoice-modal';
import { CreateDocumentForm } from './create-document-form';

type DocumentType = 'factura' | 'presupuesto' | 'nota-credito';

const facturas = [
  {
    numero: 'FACT-2023-001',
    cliente: 'Soluciones Tecnológicas S.A.',
    tipo: 'Factura',
    importe: 1452.61,
    estado: 'Pagado',
    fechaEmision: '15/10/2023',
    fechaVto: '15/11/2023',
  },
  {
    numero: 'FACT-2023-002',
    cliente: 'Diseños Creativos Cía.',
    tipo: 'Factura',
    importe: 1028.50,
    estado: 'Pendiente',
    fechaEmision: '20/10/2023',
    fechaVto: '20/11/2023',
  },
  {
    numero: 'FACT-2023-003',
    cliente: 'Maestros del Marketing',
    tipo: 'Factura',
    importe: 3025.91,
    estado: 'Vencido',
    fechaEmision: '01/09/2023',
    fechaVto: '01/10/2023',
  },
];

const getBadgeVariant = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'pagado':
      return 'default';
    case 'pendiente':
      return 'secondary';
    case 'vencido':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getBadgeClass = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagado':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'pendiente':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      case 'vencido':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'outline';
    }
  };


export default function DocumentosPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentType>('factura');
  
  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <ImportInvoiceModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <CreateDocumentForm 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        documentType={activeTab}
      />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestionar Documentos</h1>
            <p className="text-muted-foreground">
              Crea y haz seguimiento de tus facturas, presupuestos y notas de crédito.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
              <FileUp className="mr-2 h-4 w-4" />
              Importar Facturas
            </Button>
            <Button onClick={handleCreateNew}>
              <FilePlus className="mr-2 h-4 w-4" />
              Crear Nuevo Documento
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={(value) => setActiveTab(value as DocumentType)}>
          <TabsList>
            <TabsTrigger value="factura">Facturas</TabsTrigger>
            <TabsTrigger value="presupuesto">Presupuestos</TabsTrigger>
            <TabsTrigger value="nota-credito">Notas de Crédito</TabsTrigger>
          </TabsList>

          <TabsContent value="factura">
            <Card>
              <CardHeader>
                  <p className="text-sm text-muted-foreground">Una lista de tus facturas recientes.</p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Documento</TableHead>
                      <TableHead>Nombre del Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Importe Total</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                      <TableHead>Fecha Emisión</TableHead>
                      <TableHead>Fecha Vto.</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturas.map((factura) => (
                      <TableRow key={factura.numero}>
                        <TableCell className="font-medium">{factura.numero}</TableCell>
                        <TableCell>{factura.cliente}</TableCell>
                        <TableCell>{factura.tipo}</TableCell>
                        <TableCell className="text-right">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(factura.importe)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getBadgeVariant(factura.estado)} className={getBadgeClass(factura.estado)}>
                            {factura.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>{factura.fechaEmision}</TableCell>
                        <TableCell>{factura.fechaVto}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ver</DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Descargar</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="presupuesto">
            <Card>
              <CardHeader>
                  <p className="text-sm text-muted-foreground">Aquí aparecerá la lista de tus presupuestos.</p>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  No hay presupuestos para mostrar.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="nota-credito">
            <Card>
              <CardHeader>
                  <p className="text-sm text-muted-foreground">Aquí aparecerá la lista de tus notas de crédito.</p>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-12">
                  No hay notas de crédito para mostrar.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
