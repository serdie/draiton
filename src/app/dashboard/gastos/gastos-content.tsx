
'use client';

import { useState, useMemo, useEffect, useContext, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PlusCircle, MoreHorizontal, Loader2, Trash2, Pencil, FilterX, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AuthContext } from '@/context/auth-context';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RegisterExpenseModal } from './register-expense-modal';
import { deleteExpense } from '@/lib/firebase/expense-actions';
import type { ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';
import type { Expense } from './page';

const getCategoryBadgeClass = (category: string) => {
    switch (category) {
        case 'Software': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
        case 'Oficina': return 'bg-purple-600/20 text-purple-400 border-purple-500/30';
        case 'Marketing': return 'bg-pink-600/20 text-pink-400 border-pink-500/30';
        case 'Viajes': return 'bg-orange-600/20 text-orange-400 border-orange-500/30';
        case 'Suministros': return 'bg-teal-600/20 text-teal-400 border-teal-500/30';
        default: return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
    }
}

const expenseCategories = ['Software', 'Oficina', 'Marketing', 'Viajes', 'Suministros', 'Otros'];

export function GastosContent() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
    const [initialData, setInitialData] = useState<ExtractReceiptDataOutput | undefined>(undefined);
    
    // Filter states
    const [filtroTexto, setFiltroTexto] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState<string>('all');

    // Pagination states
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    
    useEffect(() => {
        if (!db || !user) {
            setLoading(false);
            return;
        }
        setLoading(true);

        const q = query(collection(db, 'expenses'), where('ownerId', '==', user.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docsList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    fecha: data.fecha instanceof Timestamp ? data.fecha.toDate() : new Date(),
                    fechaCreacion: data.fechaCreacion instanceof Timestamp ? data.fechaCreacion.toDate() : new Date(),
                } as Expense;
            });
            setExpenses(docsList.sort((a,b) => b.fecha.getTime() - a.fecha.getTime()));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching expenses:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los gastos.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, toast]);
    
    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const porTexto = !filtroTexto || 
                expense.proveedor.toLowerCase().includes(filtroTexto.toLowerCase()) ||
                expense.descripcion.toLowerCase().includes(filtroTexto.toLowerCase());

            const porCategoria = filtroCategoria === 'all' || expense.categoria === filtroCategoria;
            
            return porTexto && porCategoria;
        });
    }, [expenses, filtroTexto, filtroCategoria]);

    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

    const paginatedExpenses = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredExpenses.slice(startIndex, endIndex);
    }, [filteredExpenses, currentPage, itemsPerPage]);

    const resetFilters = () => {
        setFiltroTexto('');
        setFiltroCategoria('all');
        setCurrentPage(1);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };


    const handleOpenModal = (data?: ExtractReceiptDataOutput) => {
        setInitialData(data);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setInitialData(undefined);
    };
    
     const handleDelete = useCallback(async () => {
        if (!expenseToDelete) return;

        const { success, error } = await deleteExpense(expenseToDelete.id);

        if (success) {
            toast({ title: 'Gasto Eliminado', description: 'El gasto ha sido eliminado correctamente.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: error });
        }
        setExpenseToDelete(null);
    }, [expenseToDelete, toast]);

    return (
        <>
        <RegisterExpenseModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onOpenModal={handleOpenModal}
            initialData={initialData}
        />
        <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará el gasto permanentemente.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Eliminar</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Gastos</h1>
                    <p className="text-muted-foreground">
                        Registra, categoriza y controla todos los gastos de tu negocio.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleOpenModal()}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Digitalizar Ticket con IA
                    </Button>
                     <Button onClick={() => handleOpenModal()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Añadir Nuevo Gasto
                    </Button>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                            placeholder="Buscar por proveedor o descripción..."
                            value={filtroTexto}
                            onChange={(e) => setFiltroTexto(e.target.value)}
                        />
                        <Select value={filtroCategoria} onValueChange={(v) => setFiltroCategoria(v as any)}>
                            <SelectTrigger><SelectValue placeholder="Filtrar por categoría" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las categorías</SelectItem>
                                {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Button variant="outline" onClick={resetFilters}>
                            <FilterX className="mr-2 h-4 w-4" />Limpiar Filtros
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    {loading ? (
                         <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead className="hidden md:table-cell">Descripción</TableHead>
                                    <TableHead className="hidden lg:table-cell">Método de Pago</TableHead>
                                    <TableHead className="text-right">Importe</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedExpenses.length > 0 ? (
                                    paginatedExpenses.map(expense => (
                                        <TableRow key={expense.id}>
                                            <TableCell>{format(expense.fecha, "dd MMM yyyy", { locale: es })}</TableCell>
                                            <TableCell className="font-medium">{expense.proveedor}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn('text-xs', getCategoryBadgeClass(expense.categoria))}>
                                                    {expense.categoria}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-xs">{expense.descripcion}</TableCell>
                                            <TableCell className="hidden lg:table-cell text-muted-foreground">{expense.metodoPago}</TableCell>
                                            <TableCell className="text-right font-semibold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(expense.importe)}</TableCell>
                                            <TableCell className="text-right">
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setExpenseToDelete(expense)} className="text-destructive focus:text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            No se encontraron gastos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
            </Card>
        </div>
        </>
    );
}
