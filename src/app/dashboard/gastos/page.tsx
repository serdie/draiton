
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


export type Expense = {
    id: string;
    ownerId: string;
    fecha: Date;
    categoria: string;
    proveedor: string;
    descripcion: string;
    importe: number;
    metodoPago: string;
    fechaCreacion: Date;
};

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

export default function GastosPage() {
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
                                <SelectItem value="Software">Software</SelectItem>
                                <SelectItem value="Oficina">Oficina</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Viajes">Viajes</SelectItem>
                                <SelectItem value="Suministros">Suministros</SelectItem>
                                <SelectItem value="Otros">Otros</SelectItem>
                            </SelectContent>
                        </Select>
                         <Button variant="outline" onClick={() => { setFiltroTexto(''); setFiltroCategoria('all'); }}>
                            <FilterX className="mr-2 h-4 w-4" />Limpiar Filtros
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* TODO: Add content here */}
        </div>
        </>
    );
}

