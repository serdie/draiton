
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import type { DateRange } from "react-day-picker"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FileUp, FilePlus, MoreHorizontal, Calendar as CalendarIcon, FilterX, ChevronLeft, ChevronRight, Loader2, Trash2, Pencil, Eye, Download, Sparkles } from 'lucide-react';
import { ImportInvoiceModal } from '../documentos/import-invoice-modal';
import { CreateDocumentModal } from '../documentos/create-document-modal';
import { EditDocumentModal } from '../documentos/edit-document-modal';
import { ViewDocumentModal } from '../documentos/view-document-modal';
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
import type { Document, DocumentStatus, DocumentType, LineItem } from '../documentos/page';


const getBadgeClass = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'pagado':
    case 'aceptado':
    case 'aplicado':
      return 'bg-green-600/20 text-green-400 border-green-500/30';
    case 'pendiente':
    case 'enviado':
    case 'emitido':
    case 'activo':
      return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
    case 'vencido':
    case 'rechazado':
    case 'cancelado':
      return 'bg-red-600/20 text-red-400 border-red-500/30';
    default: // Borrador
      return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
  }
};

const estadosUnicos: DocumentStatus[] = ['Pagado', 'Pendiente', 'Vencido', 'Enviado', 'Aceptado', 'Rechazado', 'Emitido', 'Aplicado', 'Borrador'];

export default function FinanzasPage() {
  const { user } = useContext(AuthContext);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<Document | null>(null);
  const [docToView, setDocToView] = useState<Document | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  const [initialDataForForm, setInitialDataForForm] = useState<ExtractInvoiceDataOutput | undefined>(undefined);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!db || !user) {
        setLoading(false);
        return;
    }
    setLoading(true);

    const q = query(collection(db, "invoices"), where('tipo', '==', 'factura'), where('ownerId', '==', user.uid));
    
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
}, [toast, user]);

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

  const handleDelete = async () => {
    if (!docToDelete) return;
    try {
        await deleteDocument(docToDelete.id);
        toast({
            title: 'Documento Eliminado',
            description: `El documento ${docToDelete.numero} ha sido eliminado.`,
        });
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

  const renderFacturasContent = () => {
    if (loading) {
      return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
    return (
      <Card className="bg-secondary border-none">
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Listado de Facturas</h3>
            <div className='flex items-center gap-2'>
              <Button variant="ghost" onClick={() => setIsImportModalOpen(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Importar con IA
              </Button>
              <Button onClick={() => handleCreateNew()}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Crear Factura
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Nº FACTURA</TableHead>
                <TableHead>CLIENTE</TableHead>
                <TableHead>FECHA</TableHead>
                <TableHead>TOTAL</TableHead>
                <TableHead>ESTADO</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id} className="border-border/20">
                  <TableCell className="font-medium text-primary">{doc.numero}</TableCell>
                  <TableCell>{doc.cliente}</TableCell>
                  <TableCell>{format(new Date(doc.fechaEmision), "yyyy-MM-dd")}</TableCell>
                  <TableCell className="font-semibold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: doc.moneda || 'EUR' }).format(doc.importe)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('font-semibold', getBadgeClass(doc.estado))}>
                      {doc.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setDocToView(doc)}><Eye className="mr-2 h-4 w-4" />Ver</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDocToEdit(doc)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Descargar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDocToDelete(doc)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <ImportInvoiceModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onDataExtracted={handleDataExtracted} />
      {isCreateModalOpen && <CreateDocumentModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} documentType={'factura'} initialData={initialDataForForm} />}
      {docToEdit && <EditDocumentModal isOpen={!!docToEdit} onClose={() => setDocToEdit(null)} document={docToEdit} />}
      {docToView && <ViewDocumentModal isOpen={!!docToView} onClose={() => setDocToView(null)} document={docToView} />}
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>El documento <strong>{docToDelete?.numero}</strong> será eliminado permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Sí, eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión Financiera</h1>
          <p className="text-muted-foreground">Controla tus facturas, gastos e impuestos en un solo lugar.</p>
        </div>

        <Tabs defaultValue="facturacion" className="w-full">
          <TabsList className="border-b border-border/50 rounded-none p-0 bg-transparent justify-start gap-4">
            <TabsTrigger value="vision-general" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none">Visión General</TabsTrigger>
            <TabsTrigger value="facturacion" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none">Facturación</TabsTrigger>
            <TabsTrigger value="gastos" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none">Gastos</TabsTrigger>
            <TabsTrigger value="impuestos" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none">Impuestos</TabsTrigger>
            <TabsTrigger value="bancos" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none">Conexión Bancaria</TabsTrigger>
          </TabsList>
          <TabsContent value="vision-general" className="mt-6">
            <p>Próximamente: Visión General Financiera.</p>
          </TabsContent>
          <TabsContent value="facturacion" className="mt-6">
            {renderFacturasContent()}
          </TabsContent>
          <TabsContent value="gastos"  className="mt-6"><p>Próximamente: Gestión de gastos.</p></TabsContent>
          <TabsContent value="impuestos"  className="mt-6"><p>Próximamente: Previsión de impuestos.</p></TabsContent>
          <TabsContent value="bancos"  className="mt-6"><p>Próximamente: Conexión bancaria.</p></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
