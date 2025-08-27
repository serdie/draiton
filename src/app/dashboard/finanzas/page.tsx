
'use client';

import { useState, useMemo, useEffect, useContext } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { FilePlus, MoreHorizontal, Loader2, Trash2, Pencil, Eye, Download, Sparkles, Upload, Plus, Send } from 'lucide-react';
import { ImportInvoiceModal } from '../documentos/import-invoice-modal';
import { CreateDocumentModal } from '../documentos/create-document-modal';
import { EditDocumentModal } from '../documentos/edit-document-modal';
import { ViewDocumentModal } from '../documentos/view-document-modal';
import { ConnectBankModal } from './connect-bank-modal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { AuthContext } from '@/context/auth-context';
import { deleteDocument } from '@/lib/firebase/document-actions';
import type { Document, DocumentStatus } from '../documentos/page';
import { RegisterExpenseModal } from '../gastos/register-expense-modal';
import { Input } from '@/components/ui/input';

const getBadgeClass = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'pagado':
    case 'pagada':
      return 'bg-green-100 dark:bg-green-600/20 text-green-700 dark:text-green-400 border-transparent';
    case 'pendiente':
      return 'bg-yellow-100 dark:bg-yellow-600/20 text-yellow-700 dark:text-yellow-400 border-transparent';
    case 'vencido':
    case 'vencida':
      return 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 border-transparent';
    default:
      return 'bg-gray-100 dark:bg-gray-600/20 text-gray-700 dark:text-gray-400 border-transparent';
  }
};

const getCategoryBadgeClass = (category: string) => {
    switch (category) {
        case 'Software': return 'bg-blue-100 dark:bg-blue-600/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
        case 'Oficina': return 'bg-purple-100 dark:bg-purple-600/20 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-500/30';
        case 'Marketing': return 'bg-pink-100 dark:bg-pink-600/20 text-pink-800 dark:text-pink-400 border-pink-200 dark:border-pink-500/30';
        case 'Viajes': return 'bg-orange-100 dark:bg-orange-600/20 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-500/30';
        case 'Suministros': return 'bg-teal-100 dark:bg-teal-600/20 text-teal-800 dark:text-teal-400 border-teal-200 dark:border-teal-500/30';
        default: return 'bg-gray-100 dark:bg-gray-600/20 text-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-500/30';
    }
}

export default function FinanzasPage() {
  const { user } = useContext(AuthContext);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isConnectBankModalOpen, setIsConnectBankModalOpen] = useState(false);
  const [docToEdit, setDocToEdit] = useState<Document | null>(null);
  const [docToView, setDocToView] = useState<Document | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [bankConnectionToDelete, setBankConnectionToDelete] = useState<any | null>(null);

  const [initialDataForForm, setInitialDataForForm] = useState<ExtractInvoiceDataOutput | undefined>(undefined);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const gastosDeEjemplo = [
    { id: '1', proveedor: 'Amazon Web Services', fecha: new Date('2024-07-25'), importe: 75.50, categoria: 'Software' },
    { id: '2', proveedor: 'Material de Oficina S.L.', fecha: new Date('2024-07-22'), importe: 120.00, categoria: 'Oficina' },
    { id: '3', proveedor: 'Facebook Ads', fecha: new Date('2024-07-20'), importe: 250.00, categoria: 'Marketing' },
    { id: '4', proveedor: 'Renfe Viajes', fecha: new Date('2024-07-18'), importe: 85.40, categoria: 'Viajes' },
  ];
  
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
  }, [user, toast]);


  const handleCreateNew = (initialData?: ExtractInvoiceDataOutput) => {
    setInitialDataForForm(initialData);
    setIsCreateModalOpen(true);
  };
  
  const handleOpenExpenseModal = (data?: ExtractInvoiceDataOutput) => {
    setInitialDataForForm(data);
    setIsExpenseModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setInitialDataForForm(undefined);
  };
  
  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
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

  const handleDeleteBankConnection = () => {
    if (!bankConnectionToDelete) return;
    toast({ title: 'Simulación: Conexión eliminada', description: `Se ha eliminado la conexión con ${bankConnectionToDelete.name}.` });
    setBankConnectionToDelete(null);
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
      <Card className="bg-card">
        <CardHeader className="px-4 pt-4 md:px-6 md:pt-6">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-lg font-semibold">Listado de Facturas</h3>
            <div className='flex items-center gap-2'>
              <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent dark:border-border/50 dark:hover:bg-transparent">
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
                <TableRow key={doc.id} className="border-border/20 hover:bg-muted/50 dark:border-border/20 dark:hover:bg-border/20">
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
  
  const renderGastosContent = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Listado de Gastos</h3>
                        <Button onClick={() => handleOpenExpenseModal()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Añadir Gasto
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent dark:border-border/50 dark:hover:bg-transparent">
                                <TableHead>PROVEEDOR</TableHead>
                                <TableHead>FECHA</TableHead>
                                <TableHead>CATEGORÍA</TableHead>
                                <TableHead className="text-right">IMPORTE</TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gastosDeEjemplo.map((gasto) => (
                                <TableRow key={gasto.id} className="border-border/20 hover:bg-muted/50 dark:border-border/20 dark:hover:bg-border/20">
                                    <TableCell className="font-medium">{gasto.proveedor}</TableCell>
                                    <TableCell>{format(gasto.fecha, "yyyy-MM-dd")}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn('font-semibold', getCategoryBadgeClass(gasto.categoria))}>
                                            {gasto.categoria}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(gasto.importe)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem><Pencil className="mr-2 h-4 w-4"/> Editar</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="bg-secondary/50">
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base">Digitalizar Ticket con IA</CardTitle>
                        <Sparkles className="h-4 w-4 text-primary"/>
                    </div>
                </CardHeader>
                <CardContent className="text-center flex flex-col items-center justify-center h-full py-10">
                     <div className="p-4 bg-background rounded-full mb-4">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold mb-1">Extrae datos al instante</h4>
                    <p className="text-sm text-muted-foreground mb-6">
                        Usa tu cámara o sube un archivo para que nuestra IA rellene el gasto por ti.
                    </p>
                    <Button className="w-full" onClick={() => handleOpenExpenseModal()}>
                        Empezar a Digitalizar
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  const renderImpuestosContent = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card className="bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="text-base">Previsión 3er Trimestre</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">IVA a pagar</span>
                            <span className="font-semibold">1.845,20€</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">IRPF a cuenta</span>
                            <span className="font-semibold">975,50€</span>
                        </div>
                         <div className="flex justify-between items-center border-t border-border/50 pt-4 mt-4">
                            <span className="font-bold">Total a liquidar</span>
                            <span className="font-bold text-primary text-xl">2.820,70€</span>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="text-base">Modelos Tributarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            <li className="flex justify-between items-center p-2 rounded-md hover:bg-background/50">
                                <span>Modelo 303 (IVA Trimestral)</span>
                                <Link href="/dashboard/gestor-ia/asistente-fiscal" className="text-sm font-semibold text-primary hover:underline">Preparar</Link>
                            </li>
                             <li className="flex justify-between items-center p-2 rounded-md hover:bg-background/50">
                                <span>Modelo 130 (IRPF Trimestral)</span>
                                <Link href="/dashboard/gestor-ia/asistente-fiscal" className="text-sm font-semibold text-primary hover:underline">Preparar</Link>
                            </li>
                             <li className="flex justify-between items-center p-2 rounded-md hover:bg-background/50">
                                <span>Modelo 111 (Retenciones)</span>
                                <Link href="/dashboard/gestor-ia/asistente-fiscal" className="text-sm font-semibold text-primary hover:underline">Preparar</Link>
                            </li>
                             <li className="flex justify-between items-center p-2 rounded-md hover:bg-background/50">
                                <span>Modelo 115 (Alquileres)</span>
                                <Link href="/dashboard/gestor-ia/asistente-fiscal" className="text-sm font-semibold text-primary hover:underline">Preparar</Link>
                            </li>
                             <li className="flex justify-between items-center p-2 rounded-md text-muted-foreground">
                                <span>Modelo 390 (Resumen Anual IVA)</span>
                                <span className="text-sm">Próximamente</span>
                            </li>
                             <li className="flex justify-between items-center p-2 rounded-md text-muted-foreground">
                                <span>Modelo 347 (Operac. con terceros)</span>
                                <span className="text-sm">Próximamente</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
             <Card className="bg-secondary/50 lg:col-span-1 flex flex-col">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Asistente IA
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col space-y-4">
                   <div className="p-3 rounded-lg bg-background text-sm">
                     ¡Hola! Soy GestorIA. Pregúntame sobre impuestos, facturas, o cómo optimizar tu negocio.
                   </div>
                </CardContent>
                <CardFooter>
                    <div className="relative w-full">
                        <Input placeholder="Escribe tu consulta..." className="pr-10"/>
                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
  }
  
  const renderBancosContent = () => {
    const bankAccounts = [
      {
        id: '1',
        name: 'BBVA Cuenta Negocios',
        number: 'ES...**** 1234',
        status: 'Sincronizado hace 5m',
        statusColor: 'text-green-500',
        logo: <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8"><path d="M4.14,11.3,4.14,11.3c2.78-4.88,8.25-6.52,13.13-3.74,4.88,2.78,6.52,8.25,3.74,13.13C16.13,25.57,5.55,25.5,4.14,11.3Z" fill="#004481"></path><path d="M2.9,13.23,2.9,13.23c-2.78,4.88-.14,10.35,4.74,13.13,4.88,2.78,10.35.14,13.13-4.74,4.88-8.62-2.18-18.2-10.8-13.13C.1,13.37-1.54,8.35,2.9,13.23Z" fill="#004481"></path></svg>
      },
      {
        id: '2',
        name: 'CaixaBank Cuenta Corriente',
        number: 'ES...**** 5678',
        status: 'Sincronizado hace 8m',
        statusColor: 'text-green-500',
        logo: <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8"><circle cx="12" cy="12" r="10" fill="#000"></circle><path d="M12,12a5.3,5.3,0,0,0-5.3,5.3,1.4,1.4,0,0,0,1.4,1.4H15.9a1.4,1.4,0,0,0,1.4-1.4A5.3,5.3,0,0,0,12,12Z" fill="#fff"></path><path d="M13.4,5.4a2.9,2.9,0,1,0-2.8,0,5.7,5.7,0,0,0-2,4.5H15.3A5.7,5.7,0,0,0,13.4,5.4Z" fill="#ffc107"></path></svg>
      },
      {
        id: '3',
        name: 'Revolut Business',
        number: 'GB...**** 4321',
        status: 'Requiere atención',
        statusColor: 'text-yellow-500',
        logo: <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">R</div>
      },
    ]

    return (
      <Card>
        <CardHeader>
           <div className="flex justify-between items-center">
            <CardTitle className="text-base">Bancos Sincronizados</CardTitle>
            <Button onClick={() => setIsConnectBankModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Conectar Banco
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bankAccounts.map(account => (
              <div key={account.id} className="flex justify-between items-center p-3 bg-background/50 dark:bg-background/50 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div>{account.logo}</div>
                  <div>
                    <p className="font-semibold">{account.name}</p>
                    <p className="text-sm text-muted-foreground">{account.number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className={cn("text-sm font-medium", account.statusColor)}>{account.status}</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => toast({title: "Función en desarrollo"})}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setBankConnectionToDelete(account)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <ImportInvoiceModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onDataExtracted={handleDataExtracted} />
      {isCreateModalOpen && <CreateDocumentModal isOpen={isCreateModalOpen} onClose={handleCloseCreateModal} documentType={'factura'} initialData={initialDataForForm} />}
      <RegisterExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={handleCloseExpenseModal} 
        onOpenModal={(data) => handleOpenExpenseModal(data)} 
        initialData={initialDataForForm}
      />
      <ConnectBankModal isOpen={isConnectBankModalOpen} onClose={() => setIsConnectBankModalOpen(false)} />
      {docToEdit && <EditDocumentModal isOpen={!!docToEdit} onClose={() => setDocToEdit(null)} document={docToEdit} />}
      {docToView && <ViewDocumentModal isOpen={!!docToView} onClose={() => setDocToView(null)} document={docToView} />}
      
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Estás seguro?</AlertDialogTitle><AlertDialogDescription>El documento <strong>{docToDelete?.numero}</strong> será eliminado permanentemente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Sí, eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
       <AlertDialog open={!!bankConnectionToDelete} onOpenChange={(open) => !open && setBankConnectionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Conexión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se desconectará la cuenta de <strong>{bankConnectionToDelete?.name}</strong>. Tendrás que volver a sincronizarla para ver las transacciones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteBankConnection} className="bg-destructive hover:bg-destructive/90">Sí, eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión Financiera</h1>
          <p className="text-muted-foreground">Controla tus facturas, gastos e impuestos en un solo lugar.</p>
        </div>

        <Tabs defaultValue="facturacion" className="w-full">
          <TabsList>
            <TabsTrigger value="facturacion">Facturación</TabsTrigger>
            <TabsTrigger value="gastos">Gastos</TabsTrigger>
            <TabsTrigger value="impuestos">Impuestos</TabsTrigger>
            <TabsTrigger value="bancos">Conexión Bancaria</TabsTrigger>
          </TabsList>
          <TabsContent value="facturacion" className="mt-6">
            {renderFacturasContent()}
          </TabsContent>
          <TabsContent value="gastos"  className="mt-6">
            {renderGastosContent()}
          </TabsContent>
          <TabsContent value="impuestos"  className="mt-6">
            {renderImpuestosContent()}
          </TabsContent>
          <TabsContent value="bancos"  className="mt-6">{renderBancosContent()}</TabsContent>
        </Tabs>
      </div>
    </>
  );
}
