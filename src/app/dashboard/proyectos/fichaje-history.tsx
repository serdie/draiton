
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Fichaje } from './types';
import { Button } from '@/components/ui/button';
import { Download, Calendar as CalendarIcon, Edit } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
import { RequestChangeModal } from './request-change-modal';


interface FichajeHistoryProps {
  allFichajes: Fichaje[];
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

export function FichajeHistory({ allFichajes }: FichajeHistoryProps) {
  const [period, setPeriod] = useState<Period>('semana');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [fichajeToChange, setFichajeToChange] = useState<Fichaje | null>(null);


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

    if (!startDate) return [];
    
    // Ensure endDate covers the whole day
    if(endDate) {
        endDate = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }


    return allFichajes.filter(f => {
        const timestamp = f.timestamp;
        const isInRange = timestamp >= startDate! && (endDate ? timestamp <= endDate : true);
        return isInRange;
    });

  }, [allFichajes, period, customDateRange]);

  const handleExport = () => {
    // Basic CSV export logic
    const headers = "Fecha,Dia,Tipo,Hora";
    const rows = filteredFichajes.map(f => 
        `${format(f.timestamp, 'yyyy-MM-dd')},${format(f.timestamp, 'eeee', {locale: es})},${f.type},${format(f.timestamp, 'HH:mm:ss')}`
    ).join('\n');
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historial_fichajes_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
    {fichajeToChange && (
        <RequestChangeModal 
            isOpen={!!fichajeToChange}
            onClose={() => setFichajeToChange(null)}
            fichaje={fichajeToChange}
        />
    )}
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
            <CardTitle>Mi Historial de Fichajes</CardTitle>
            <CardDescription>Consulta tus registros de entrada y salida.</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="semana">Esta semana</SelectItem>
                    <SelectItem value="mes">Este mes</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
            </Select>
            {period === 'personalizado' && (
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button id="date" variant={"outline"} className={cn("w-full sm:w-auto justify-start text-left font-normal", !customDateRange && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customDateRange?.from ? (customDateRange.to ? (<>{format(customDateRange.from, "LLL dd, y", { locale: es })} - {format(customDateRange.to, "LLL dd, y", { locale: es })}</>) : (format(customDateRange.from, "LLL dd, y", { locale: es }))) : (<span>Elige un rango de fechas</span>)}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar initialFocus mode="range" defaultMonth={customDateRange?.from} selected={customDateRange} onSelect={setCustomDateRange} numberOfMonths={2} locale={es}/>
                    </PopoverContent>
                </Popover>
            )}
             <Button variant="outline" size="icon" onClick={handleExport} disabled={filteredFichajes.length === 0}>
                <Download className="h-4 w-4" />
             </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Día</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Hora</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFichajes.length > 0 ? (
              filteredFichajes.map((fichaje) => (
                <TableRow key={fichaje.id}>
                  <TableCell>{format(fichaje.timestamp, 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="capitalize">{format(fichaje.timestamp, 'eeee', { locale: es })}</TableCell>
                  <TableCell>
                    <span className={cn('font-semibold', getTypeClass(fichaje.type))}>
                      {fichaje.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{format(fichaje.timestamp, 'HH:mm:ss')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setFichajeToChange(fichaje)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hay registros para este periodo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </>
  );
}
