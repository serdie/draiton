
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfWeek, startOfMonth, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Fichaje } from './types';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface FichajeHistoryProps {
  fichajes: Fichaje[];
}

type Period = 'semana' | 'mes' | 'siempre';

export function FichajeHistory({ fichajes }: FichajeHistoryProps) {
  const [period, setPeriod] = useState<Period>('semana');

  const filteredFichajes = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'mes':
        startDate = startOfMonth(now);
        break;
      case 'siempre':
        startDate = new Date(0); // Epoch
        break;
      case 'semana':
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        break;
    }

    return fichajes.filter(f => f.timestamp >= startDate);
  }, [fichajes, period]);

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Mi Historial de Fichajes</CardTitle>
            <CardDescription>Consulta tus registros de entrada y salida.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar periodo" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="semana">Esta semana</SelectItem>
                    <SelectItem value="mes">Este mes</SelectItem>
                    <SelectItem value="siempre">Siempre</SelectItem>
                </SelectContent>
            </Select>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFichajes.length > 0 ? (
              filteredFichajes.map((fichaje) => (
                <TableRow key={fichaje.id}>
                  <TableCell>{format(fichaje.timestamp, 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="capitalize">{format(fichaje.timestamp, 'eeee', { locale: es })}</TableCell>
                  <TableCell>
                    <span className={`font-semibold ${fichaje.type === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {fichaje.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">{format(fichaje.timestamp, 'HH:mm:ss')}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No hay registros para este periodo.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

