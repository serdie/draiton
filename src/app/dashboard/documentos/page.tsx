
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import type { DateRange } from "react-day-picker"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FileUp, FilePlus, MoreHorizontal, Calendar as CalendarIcon, FilterX, ChevronLeft, ChevronRight, Loader2, Trash2, Pencil, Eye, Download } from 'lucide-react';
import { ImportInvoiceModal } from './import-invoice-modal';
import { CreateDocumentModal } from './create-document-modal';
import { EditDocumentModal } from './edit-document-modal';
import { ViewDocumentModal } from './view-document-modal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { AuthContext } from '@/context/auth-context';
import { deleteDocument } from '@/lib/firebase/document-actions';


export type DocumentType = 'factura' | 'presupuesto' | 'nota-credito' | 'recurrente';
export type DocumentStatus = 'Pagado' | 'Pendiente' | 'Vencido' | 'Enviado' | 'Aceptado' | 'Rechazado' | 'Emitido' | 'Aplicado' | 'Borrador' | 'Activo' | 'Pausado';

export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Document = {
  id: string;
  ownerId: string;
  cliente: string;
  clienteCif?: string;
  clienteDireccion?: string;
  tipo: DocumentType;
  importe: number;
  subtotal: number;
  impuestos: number;
  estado: DocumentStatus;
  fechaEmision: Date;
  fechaVto: Date | null;
  numero: string;
  lineas: LineItem[];
  moneda: string;
};


const getBadgeClass = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'pagado':
    case 'aceptado':
    case 'aplicado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pendiente':
    case 'enviado':
    case 'emitido':
    case 'activo':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'vencido':
    case 'rechazado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const estadosUnicos: DocumentStatus[] = ['Pagado', 'Pendiente', 'Vencido', 'Enviado', 'Aceptado', 'Rechazado', 'Emitido', 'Aplicado', 'Borrador', 'Activo', 'Pausado'];

export default function DocumentosPage() {
  const { user } = useContext(AuthContext);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<Document | null>(null);
  const [docToView, setDocToView] = useState<Document | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  const [initialDataForForm, setInitialDataForForm] = useState<ExtractInvoiceDataOutput | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<DocumentType>('factura');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('all');

  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    if (!db || !user) {
        setLoading(false);
        return;
    }
    setLoading(true);

    const q = query(collection(db, "invoices"), where('tipo', '==', activeTab), where('ownerId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const docsList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                fechaEmision: data.fechaEmision instanceof Timestamp ? data.fechaEmision.toDate() : new Date(),
                fechaVto: data.fechaVto instanceof Timestamp ? data.fechaVto.toDate() : null,
            } as Document;
        });
        setDocuments(docsList.sort((a,b) => b.fechaEmision.getTime() - a.fechaEmision.getTime()));
        setLoading(false);
    }, (error) => {
        console.error("Error fetching documents:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los documentos.' });
        setLoading(false);
    });

    return () => unsubscribe();
}, [activeTab, toast, user]);

  const handleCreateNew = (initialData?: ExtractInvoiceDataOutput) => {
    setInitialDataForForm(initialData);
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setInitialDataForForm(undefined);
  };

  const handleDataExtracted = (data: ExtractInvoiceDataOutput) => {
    setIsImportModalOpen(false);
    handleCreateNew(data);
  };

  const documentosFiltrados = useMemo(() => {
    return documents.filter(doc => {
      const fechaDoc = new Date(doc.fechaEmision);
      const enRangoFecha = !dateRange || (
        (!dateRange.from || fechaDoc >= dateRange.from) &&
        (!dateRange.to || fechaDoc <= new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)))
      );
      const porCliente = !filtroCliente || doc.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
      const porEstado = filtroEstado === 'all' || doc.estado === filtroEstado;
      
      return enRangoFecha && porCliente && porEstado;
    });
  }, [documents, dateRange, filtroCliente, filtroEstado]);

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

  const handleDelete = async () => {
    if (!docToDelete) return;
    
    try {
        await deleteDocument(docToDelete.id);
        toast({
            title: 'Documento Eliminado',
            description: `El documento ${docToDelete.numero} ha sido eliminado.`,
        });
        // La actualización de la UI se maneja con onSnapshot, por lo que no es necesario filtrar el estado localmente.
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error al eliminar',
            description: 'No se pudo eliminar el documento. Revisa la consola para más detalles.',
        });
    } finally {
        setDocToDelete(null);
    }
  };

  const handleDownload = () => {
    toast({
      title: 'Función en desarrollo',
      description: 'La descarga de PDF estará disponible próximamente.',
    });
  }


  const renderContent = () => {
    if (loading) {
      return (
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      )
    }

    if (paginatedDocs.length === 0 && (filtroCliente || filtroEstado !== 'all' || dateRange)) {
      return (
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            No hay documentos para mostrar con los filtros aplicados.
          </div>
        </CardContent>
      );
    }
     if (documents.length === 0) {
      return (
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            Aún no has creado ningún documento de este tipo.
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
              {paginatedDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.numero}</TableCell>
                  <TableCell>{doc.cliente}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: doc.moneda || 'EUR' }).format(doc.importe)}
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
                        <DropdownMenuItem onClick={() => setDocToView(doc)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDocToEdit(doc)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Descargar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDocToDelete(doc)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
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
      <ImportInvoiceModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onDataExtracted={handleDataExtracted}
      />
      {isCreateModalOpen && (
        <CreateDocumentModal 
            isOpen={isCreateModalOpen} 
            onClose={handleCloseCreateModal} 
            documentType={activeTab}
            initialData={initialDataForForm}
        />
      )}
      {docToEdit && (
        <EditDocumentModal
            isOpen={!!docToEdit}
            onClose={() => setDocToEdit(null)}
            document={docToEdit}
        />
      )}
      {docToView && (
        <ViewDocumentModal
            isOpen={!!docToView}
            onClose={() => setDocToView(null)}
            document={docToView}
        />
      )}

       <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. El documento <strong>{docToDelete?.numero}</strong> será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              Importar Factura
            </Button>
            <Button onClick={() => handleCreateNew()}>
              <FilePlus className="mr-2 h-4 w-4" />
              Crear Nuevo Documento
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="factura">Facturas</TabsTrigger>
            <TabsTrigger value="presupuesto">Presupuestos</TabsTrigger>
            <TabsTrigger value="nota-credito">Notas de Crédito</TabsTrigger>
          </TabsList>
          
          <Card className="mt-4">
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

             <TabsContent value="factura">{renderContent()}</TabsContent>
             <TabsContent value="presupuesto">{renderContent()}</TabsContent>
             <TabsContent value="nota-credito">{renderContent()}</TabsContent>
          </Card>
        </Tabs>
      </div>
    </>
  );
}
