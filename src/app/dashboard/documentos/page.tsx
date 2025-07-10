'use client';

import { useState, useMemo } from 'react';
import type { DateRange } from "react-day-picker"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileUp, FilePlus, MoreHorizontal, Calendar as CalendarIcon, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImportInvoiceModal } from './import-invoice-modal';
import { CreateDocumentForm } from './create-document-form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';


type DocumentType = 'factura' | 'presupuesto' | 'nota-credito';

const documentos = [
  // Facturas
  { id: 'FACT-2023-001', cliente: 'Soluciones Tecnológicas S.A.', tipo: 'factura' as DocumentType, importe: 1452.61, estado: 'Pagado', fechaEmision: '2023-10-15', fechaVto: '2023-11-15' },
  { id: 'FACT-2023-002', cliente: 'Diseños Creativos Cía.', tipo: 'factura' as DocumentType, importe: 1028.50, estado: 'Pendiente', fechaEmision: '2023-10-20', fechaVto: '2023-11-20' },
  { id: 'FACT-2023-003', cliente: 'Maestros del Marketing', tipo: 'factura' as DocumentType, importe: 3025.91, estado: 'Vencido', fechaEmision: '2023-09-01', fechaVto: '2023-10-01' },
  { id: 'FACT-2023-004', cliente: 'Soluciones Tecnológicas S.A.', tipo: 'factura' as DocumentType, importe: 850.00, estado: 'Pendiente', fechaEmision: '2023-11-05', fechaVto: '2023-12-05' },
  
  // Presupuestos
  { id: 'PRES-2023-010', cliente: 'Innovación Digital Corp', tipo: 'presupuesto' as DocumentType, importe: 5500.00, estado: 'Enviado', fechaEmision: '2023-11-01', fechaVto: '2023-11-30' },
  { id: 'PRES-2023-011', cliente: 'Futuro Verde ONG', tipo: 'presupuesto' as DocumentType, importe: 1200.75, estado: 'Aceptado', fechaEmision: '2023-10-25', fechaVto: '2023-11-25' },
  { id: 'PRES-2023-012', cliente: 'Construcciones Rápidas', tipo: 'presupuesto' as DocumentType, importe: 8900.00, estado: 'Rechazado', fechaEmision: '2023-11-10', fechaVto: '2023-12-10' },

  // Notas de Crédito
  { id: 'NC-2023-005', cliente: 'Maestros del Marketing', tipo: 'nota-credito' as DocumentType, importe: 250.00, estado: 'Emitido', fechaEmision: '2023-09-15', fechaVto: '' },
  { id: 'NC-2023-006', cliente: 'Diseños Creativos Cía.', tipo: 'nota-credito' as DocumentType, importe: 100.50, estado: 'Aplicado', fechaEmision: '2023-11-02', fechaVto: '' },
];


const getBadgeClass = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'pagado':
    case 'aceptado':
    case 'aplicado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pendiente':
    case 'enviado':
    case 'emitido':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'vencido':
    case 'rechazado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const estadosUnicos = [...new Set(documentos.map(d => d.estado))];

export default function DocumentosPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DocumentType>('factura');

  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('all');

  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const handleCreateNew = () => setIsCreateModalOpen(true);

  const documentosFiltrados = useMemo(() => {
    return documentos.filter(doc => {
      const fechaDoc = new Date(doc.fechaEmision);
      const enRangoFecha = !dateRange || (
        (!dateRange.from || fechaDoc >= dateRange.from) &&
        (!dateRange.to || fechaDoc <= new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)))
      );
      const porCliente = !filtroCliente || doc.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
      const porEstado = filtroEstado === 'all' || doc.estado === filtroEstado;
      
      return doc.tipo === activeTab && enRangoFecha && porCliente && porEstado;
    });
  }, [activeTab, dateRange, filtroCliente, filtroEstado]);

  const totalPages = Math.ceil(documentosFiltrados.length / itemsPerPage);

  const paginatedDocs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return documentosFiltrados.slice(startIndex, endIndex);
  }, [documentosFiltrados, currentPage, itemsPerPage]);

  const resetFilters = () => {
    setDateRange(undefined);
    setFiltroCliente('');
    setFiltroEstado('all');
    setCurrentPage(1);
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as DocumentType);
    resetFilters();
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const renderContent = (docs: typeof documentos) => {
    if (docs.length === 0) {
      return (
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            No hay documentos para mostrar con los filtros aplicados.
          </div>
        </CardContent>
      );
    }

    return (
      <>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Documento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Importe</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Fecha Vto.</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.id}</TableCell>
                  <TableCell>{doc.cliente}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(doc.importe)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={cn('font-normal', getBadgeClass(doc.estado))}>
                      {doc.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(doc.fechaEmision), "dd MMM yyyy", { locale: es })}</TableCell>
                  <TableCell>{doc.fechaVto ? format(new Date(doc.fechaVto), "dd MMM yyyy", { locale: es }) : '-'}</TableCell>
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
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Resultados por página:</span>
            <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-20 h-8">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span>Página {currentPage} de {totalPages > 0 ? totalPages : 1}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardFooter>
      </>
    );
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

        <Card>
            <CardHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button id="date" variant={"outline"} className={cn("justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (dateRange.to ? (<>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>) : (format(dateRange.from, "LLL dd, y"))) : (<span>Selecciona un rango</span>)}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es}/>
                        </PopoverContent>
                    </Popover>
                     <Input placeholder="Buscar por cliente..." value={filtroCliente} onChange={(e) => setFiltroCliente(e.target.value)} />
                    <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                        <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">Todos los estados</SelectItem>
                            {estadosUnicos.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={resetFilters}><FilterX className="mr-2 h-4 w-4" />Limpiar Filtros</Button>
                </div>
            </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="factura">Facturas</TabsTrigger>
            <TabsTrigger value="presupuesto">Presupuestos</TabsTrigger>
            <TabsTrigger value="nota-credito">Notas de Crédito</TabsTrigger>
          </TabsList>
          
          <TabsContent value="factura"><Card>{renderContent(paginatedDocs)}</Card></TabsContent>
          <TabsContent value="presupuesto"><Card>{renderContent(paginatedDocs)}</Card></TabsContent>
          <TabsContent value="nota-credito"><Card>{renderContent(paginatedDocs)}</Card></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
