
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Fichaje, Employee } from './types';
import { Button } from '@/components/ui/button';
import { Download, Calendar as CalendarIcon, Edit, Eye, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { ViewFichajeModal } from '../../proyectos/view-fichaje-modal';

interface FichajesHistoryTableProps {
  allFichajes: Fichaje[];
  employees: Employee[];
}

type Period = 'semana' | 'mes' | 'personalizado';

const getTypeClass = (type: Fichaje['type']) => {
    switch(type) {
        case 'Entrada': return 'text-green-600';
        case 'Salida': return 'text-red-600';
        case 'Inicio Descanso': return 'text-blue-500';
        case 'Fin Descanso': return 'text-blue-800 dark:text-blue-300';
        default: return '';
    }
}

export function FichajesHistoryTable({ allFichajes, employees }: FichajesHistoryTableProps) {
  const [period, setPeriod] = useState<Period>('semana');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [fichajeToView, setFichajeToView] = useState<Fichaje | null>(null);
  const [filtroEmpleado, setFiltroEmpleado] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const employeeMap = useMemo(() => new Map(employees.map(e => [e.id, e.name])), [employees]);

  const filteredFichajes = useMemo(() => {
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    switch (period) {
      case 'mes':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'personalizado':
        startDate = customDateRange?.from;
        endDate = customDateRange?.to ? new Date(new Date(customDateRange.to).setHours(23, 59, 59, 999)) : customDateRange?.from;
        break;
      case 'semana':
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
    }

    return allFichajes.filter(f => {
        const byEmployee = filtroEmpleado === 'all' || f.employeeId === filtroEmpleado;
        const byDate = !startDate || (f.timestamp >= startDate! && (endDate ? f.timestamp <= endDate : true));
        return byEmployee && byDate;
    });

  }, [allFichajes, period, customDateRange, filtroEmpleado]);

  const totalPages = Math.ceil(filteredFichajes.length / itemsPerPage);
  const paginatedFichajes = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredFichajes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFichajes, currentPage, itemsPerPage]);

  const resetFilters = () => {
    setFiltroEmpleado('all');
    setPeriod('semana');
    setCustomDateRange(undefined);
    setCurrentPage(1);
  };


  const handleExport = () => {
    const headers = "Fecha,Dia,Empleado,Tipo,Hora,Modalidad,Detalles Pausa,Justificacion";
    
    const rows = filteredFichajes.map(f => {
        const date = format(f.timestamp, 'yyyy-MM-dd');
        const day = format(f.timestamp, 'eeee', { locale: es });
        const employeeName = employeeMap.get(f.employeeId) || f.employeeId;
        const type = f.type;
        const time = format(f.timestamp, 'HH:mm:ss');
        
        let modality = '';
        if (f.type === 'Entrada' || f.type === 'Fin Descanso') {
            modality = f.workModality || '';
        }

        let breakDetailsStr = '';
        if (f.type === 'Inicio Descanso' && f.breakDetails) {
            const details = [];
            if (f.breakDetails.isSplitShift) details.push('Jornada partida');
            if (f.breakDetails.isPersonal) details.push('Personal');
            if (f.breakDetails.isJustified) details.push('Justificada');
            breakDetailsStr = details.join(', ');
        }
        
        const justification = (f.type === 'Inicio Descanso' && f.breakDetails?.isJustified) 
            ? f.breakDetails.justificationType || '' 
            : '';
        
        const safeEmployeeName = `"${employeeName.replace(/"/g, '""')}"`;
        const safeBreakDetails = `"${breakDetailsStr.replace(/"/g, '""')}"`;
        const safeJustification = `"${justification.replace(/"/g, '""')}"`;

        return [date, day, safeEmployeeName, type, time, modality, safeBreakDetails, safeJustification].join(',');
    }).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historial_fichajes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
    {fichajeToView && (
        <ViewFichajeModal
            isOpen={!!fichajeToView}
            onClose={() => setFichajeToView(null)}
            fichaje={fichajeToView}
        />
    )}
    <Card>
      <CardHeader>
        <CardTitle>Historial de Fichajes de la Empresa</CardTitle>
        <CardDescription>Consulta y exporta todos los registros de fichajes.</CardDescription>
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
             <Select value={filtroEmpleado} onValueChange={setFiltroEmpleado}>
                <SelectTrigger><SelectValue placeholder="Filtrar por empleado..."/></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los empleados</SelectItem>
                    {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar periodo" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="semana">Esta semana</SelectItem>
                    <SelectItem value="mes">Este mes</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
            </Select>
            {period === 'personalizado' && (
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button id="date-range-picker" variant={"outline"} className={cn("justify-start text-left font-normal", !customDateRange && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateRange?.from ? (customDateRange.to ? (<>{format(customDateRange.from, "LLL dd, y", { locale: es })} - {format(customDateRange.to, "LLL dd, y", { locale: es })}</>) : (format(customDateRange.from, "LLL dd, y", { locale: es }))) : (<span>Elige un rango</span>)}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar initialFocus mode="range" defaultMonth={customDateRange?.from} selected={customDateRange} onSelect={setCustomDateRange} numberOfMonths={2} locale={es}/>
                    </PopoverContent>
                </Popover>
            )}
            <div className="flex gap-2">
                 <Button variant="outline" onClick={resetFilters} className="w-full"><FilterX className="mr-2 h-4 w-4"/> Limpiar</Button>
                <Button variant="outline" size="icon" onClick={handleExport} disabled={filteredFichajes.length === 0}>
                    <Download className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Hora</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFichajes.length > 0 ? (
              paginatedFichajes.map((fichaje) => (
                <TableRow key={fichaje.id}>
                  <TableCell className="font-medium">{employeeMap.get(fichaje.employeeId) || 'Desconocido'}</TableCell>
                  <TableCell>{format(fichaje.timestamp, 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <span className={cn('font-semibold', getTypeClass(fichaje.type))}>
                      {fichaje.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{format(fichaje.timestamp, 'HH:mm:ss')}</TableCell>
                   <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFichajeToView(fichaje)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hay registros para los filtros seleccionados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
       <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {paginatedFichajes.length} de {filteredFichajes.length} fichajes.
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
    </>
  );
}
