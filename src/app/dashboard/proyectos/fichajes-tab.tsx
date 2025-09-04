
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { DateRange } from "react-day-picker";

type Fichaje = {
    id: string;
    employeeName: string;
    type: 'Entrada' | 'Salida';
    timestamp: Date;
}

const initialFichajes: Fichaje[] = [
    { id: '1', employeeName: 'Ana García', type: 'Entrada', timestamp: new Date(new Date().setHours(9, 2, 15)) },
    { id: '2', employeeName: 'Carlos Martínez', type: 'Entrada', timestamp: new Date(new Date().setHours(9, 5, 30)) },
    { id: '3', employeeName: 'Laura Sánchez', type: 'Entrada', timestamp: new Date(new Date().setHours(8, 58, 45)) },
    { id: '4', employeeName: 'Ana García', type: 'Salida', timestamp: new Date(new Date().setHours(17, 3, 20)) },
    { id: '5', employeeName: 'Carlos Martínez', type: 'Salida', timestamp: new Date(new Date().setHours(17, 35, 10)) },
    { id: '6', employeeName: 'Laura Sánchez', type: 'Salida', timestamp: new Date(new Date().setHours(18, 1, 5)) },
];

const employees = ['Ana García', 'Carlos Martínez', 'Laura Sánchez'];

export function FichajesTab() {
    const [fichajes] = useState<Fichaje[]>(initialFichajes);
    const [filtroEmpleado, setFiltroEmpleado] = useState('all');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const filteredFichajes = useMemo(() => {
        return fichajes.filter(fichaje => {
            const enRangoFecha = !dateRange || (
                (!dateRange.from || fichaje.timestamp >= dateRange.from) &&
                (!dateRange.to || fichaje.timestamp <= new Date(new Date(dateRange.to).setHours(23, 59, 59, 999)))
            );
            const porEmpleado = filtroEmpleado === 'all' || fichaje.employeeName === filtroEmpleado;
            return enRangoFecha && porEmpleado;
        });
    }, [fichajes, filtroEmpleado, dateRange]);
    
    const totalPages = Math.ceil(filteredFichajes.length / itemsPerPage);

    const paginatedFichajes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredFichajes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredFichajes, currentPage, itemsPerPage]);

     const resetFilters = () => {
        setFiltroEmpleado('all');
        setDateRange(undefined);
        setCurrentPage(1);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registro de Fichajes</CardTitle>
                <CardDescription>Consulta las entradas y salidas de tus empleados.</CardDescription>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                    <Select value={filtroEmpleado} onValueChange={setFiltroEmpleado}>
                        <SelectTrigger><SelectValue placeholder="Filtrar por empleado" /></SelectTrigger>
                        <SelectContent>
                             <SelectItem value="all">Todos los empleados</SelectItem>
                            {employees.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                        </SelectContent>
                    </Select>
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
                    <Button variant="outline" onClick={resetFilters}><FilterX className="mr-2 h-4 w-4" />Limpiar Filtros</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Empleado</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Hora</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedFichajes.length > 0 ? (
                            paginatedFichajes.map(fichaje => (
                                <TableRow key={fichaje.id}>
                                    <TableCell className="font-medium">{fichaje.employeeName}</TableCell>
                                    <TableCell>
                                        <Badge variant={fichaje.type === 'Entrada' ? 'default' : 'secondary'}>
                                            {fichaje.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(fichaje.timestamp, "PPP", { locale: es })}</TableCell>
                                    <TableCell>{format(fichaje.timestamp, "HH:mm:ss", { locale: es })}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No hay fichajes para los filtros seleccionados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                 <div className="text-sm text-muted-foreground">
                    Mostrando {paginatedFichajes.length} de {filteredFichajes.length} registros.
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
    );
}
