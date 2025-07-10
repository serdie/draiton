'use client';

import { useState, useMemo } from 'react';
import type { DateRange } from "react-day-picker"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Calendar as CalendarIcon, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RegisterExpenseModal } from './register-expense-modal';
import type { ExtractReceiptDataOutput } from '@/ai/flows/extract-receipt-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';


const gastos = [
  {
    fecha: '2023-11-01',
    categoria: 'Software',
    proveedor: 'Suscripción GenialApp',
    descripcion: 'Suscripción mensual a herramienta de diseño.',
    metodoPago: 'Credit Card',
    importe: 49.99,
  },
  {
    fecha: '2023-11-05',
    categoria: 'Oficina',
    proveedor: 'Materiales Escritorio S.L.',
    descripcion: 'Compra de bolígrafos y libretas.',
    metodoPago: 'Cash',
    importe: 25.5,
  },
  {
    fecha: '2023-11-10',
    categoria: 'Marketing',
    proveedor: 'Publicidad Online',
    descripcion: 'Campaña de anuncios en Facebook.',
    metodoPago: 'Credit Card',
    importe: 150.0,
  },
  {
    fecha: '2023-11-15',
    categoria: 'Viajes',
    proveedor: 'Renfe',
    descripcion: 'Billete de tren para reunión con cliente.',
    metodoPago: 'Debit Card',
    importe: 75.2,
  },
  {
    fecha: '2023-11-20',
    categoria: 'Otros',
    proveedor: 'Cafetería La Esquina',
    descripcion: 'Café reunión equipo.',
    metodoPago: 'Cash',
    importe: 12.8,
  },
  {
    fecha: '2023-10-25',
    categoria: 'Software',
    proveedor: 'Adobe',
    descripcion: 'Suscripción Creative Cloud',
    metodoPago: 'Credit Card',
    importe: 59.99,
  },
  {
    fecha: '2023-11-21',
    categoria: 'Suministros',
    proveedor: 'Amazon',
    descripcion: 'Agua y café para la oficina',
    metodoPago: 'Credit Card',
    importe: 35.0,
  },
  {
    fecha: '2023-11-22',
    categoria: 'Viajes',
    proveedor: 'Booking.com',
    descripcion: 'Hotel para viaje de negocios',
    metodoPago: 'Credit Card',
    importe: 120.0,
  },
  {
    fecha: '2023-11-23',
    categoria: 'Oficina',
    proveedor: 'Ikea',
    descripcion: 'Silla de oficina nueva',
    metodoPago: 'Debit Card',
    importe: 89.99,
  },
  {
    fecha: '2023-11-24',
    categoria: 'Software',
    proveedor: 'Google Workspace',
    descripcion: 'Suscripción mensual',
    metodoPago: 'Credit Card',
    importe: 12.5,
  },
  {
    fecha: '2023-11-25',
    categoria: 'Marketing',
    proveedor: 'Canva Pro',
    descripcion: 'Suscripción anual',
    metodoPago: 'Credit Card',
    importe: 109.99,
  },
];

const categoriasUnicas = [...new Set(gastos.map(g => g.categoria))];
const proveedoresUnicos = [...new Set(gastos.map(g => g.proveedor))];
const metodosPagoUnicos = [...new Set(gastos.map(g => g.metodoPago))];

const getCategoryBadgeClass = (category: string) => {
  switch (category.toLowerCase()) {
    case 'software':
      return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800';
    case 'oficina':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800';
    case 'marketing':
      return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800';
    case 'viajes':
      return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800';
    case 'suministros':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800';
    case 'otros':
      return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    default:
      return 'bg-secondary text-secondary-foreground border-border hover:bg-secondary/80';
  }
};

export default function GastosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialData, setInitialData] = useState<ExtractReceiptDataOutput | undefined>();

  // Filter states
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [categoria, setCategoria] = useState('all');
  const [proveedor, setProveedor] = useState('');
  const [metodoPago, setMetodoPago] = useState('all');
  
  // Pagination states
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const gastosFiltrados = useMemo(() => {
    return gastos.filter(gasto => {
      const fechaGasto = new Date(gasto.fecha);
      const enRangoFecha = !dateRange || (
        (!dateRange.from || fechaGasto >= dateRange.from) &&
        (!dateRange.to || fechaGasto <= new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)))
      );
      const porCategoria = categoria === 'all' || gasto.categoria === categoria;
      const porProveedor = !proveedor || gasto.proveedor.toLowerCase().includes(proveedor.toLowerCase());
      const porMetodoPago = metodoPago === 'all' || gasto.metodoPago === metodoPago;
      
      return enRangoFecha && porCategoria && porProveedor && porMetodoPago;
    });
  }, [dateRange, categoria, proveedor, metodoPago]);

  const totalPages = Math.ceil(gastosFiltrados.length / itemsPerPage);

  const paginatedGastos = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return gastosFiltrados.slice(startIndex, endIndex);
  }, [gastosFiltrados, currentPage, itemsPerPage]);

  const resetFilters = () => {
    setDateRange(undefined);
    setCategoria('all');
    setProveedor('');
    setMetodoPago('all');
    setCurrentPage(1);
  }

  const handleOpenModal = (data?: ExtractReceiptDataOutput) => {
    setInitialData(data);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInitialData(undefined);
  }
  
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <>
      <RegisterExpenseModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        onOpenModal={handleOpenModal} 
        initialData={initialData}
      />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Gastos</h1>
            <p className="text-muted-foreground">
              Lleva un control detallado de todos los gastos de tu negocio.
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Nuevo Gasto
          </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                            "justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                            dateRange.to ? (
                                <>
                                {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                                {format(dateRange.to, "LLL dd, y", { locale: es })}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y", { locale: es })
                            )
                            ) : (
                            <span>Selecciona un rango</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                            locale={es}
                        />
                        </PopoverContent>
                    </Popover>
                    <Select value={categoria} onValueChange={setCategoria}>
                        <SelectTrigger>
                            <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">Todas las categorías</SelectItem>
                            {categoriasUnicas.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Input 
                        placeholder="Buscar por proveedor..."
                        value={proveedor}
                        onChange={(e) => setProveedor(e.target.value)}
                    />
                    <Select value={metodoPago} onValueChange={setMetodoPago}>
                        <SelectTrigger>
                            <SelectValue placeholder="Método de pago" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los métodos</SelectItem>
                            {metodosPagoUnicos.map(met => <SelectItem key={met} value={met}>{met}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={resetFilters}>
                        <FilterX className="mr-2 h-4 w-4" />
                        Limpiar Filtros
                    </Button>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listado de Gastos</CardTitle>
            <CardDescription>
              Listado de tus gastos recientes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Método Pago</TableHead>
                  <TableHead className="text-right">Importe</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedGastos.length > 0 ? paginatedGastos.map((gasto, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(gasto.fecha), "dd MMM yyyy", { locale: es })}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('font-normal', getCategoryBadgeClass(gasto.categoria))}>
                        {gasto.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{gasto.proveedor}</TableCell>
                    <TableCell>{gasto.descripcion}</TableCell>
                    <TableCell>{gasto.metodoPago}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(gasto.importe)}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center h-24">
                            No se encontraron gastos con los filtros aplicados.
                        </TableCell>
                    </TableRow>
                )}
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
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setCurrentPage(p => p - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                             className="h-8 w-8"
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

    