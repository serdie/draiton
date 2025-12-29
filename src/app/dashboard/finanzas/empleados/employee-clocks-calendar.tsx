
'use client';

// 1. Importar todo lo necesario
import { useState } from 'react';
import { type Dispatch, type SetStateAction } from 'react'; // Importar tipos de React
import { Calendar } from '@/components/ui/calendar';
import { type Fichaje, type Employee } from './types'; // Importar AMBOS tipos
import { EmployeeDayClocks } from './employee-day-clocks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// 2. Definir las props correctamente
interface EmployeeClocksCalendarProps {
    employee: Employee; // Usar el tipo importado
    fichajes: Fichaje[];
   	// Usar el tipo exacto del 'useState' del padre (que puede ser null)
   	onViewFichaje: Dispatch<SetStateAction<Fichaje | null>>;
}

// 3. El componente
export function EmployeeClocksCalendar({ employee, fichajes, onViewFichaje }: EmployeeClocksCalendarProps) {
   	const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
   	const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

   	const fichajesByDay = fichajes.reduce((acc, f) => {
   	   	const day = f.timestamp.toDateString();
   	   	if (!acc[day]) {
   	   	   	acc[day] = [];
   	   	}
   	   	acc[day].push(f);
   	   	return acc;
   	}, {} as Record<string, Fichaje[]>);

   	const ClockInIcon = () => <div className="h-1.5 w-1.5 rounded-full bg-green-500" />;
   	const ClockOutIcon = () => <div className="h-1.5 w-1.5 rounded-full bg-red-500" />;
   	const BreakIcon = () => <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />;

   	// 4. JSX (100% limpio)
   	return (
   	   	<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
   	   	   	<Calendar
   	   	   	   	mode="single"
   	   	   	   	selected={selectedDay}
   	   	   	   	onSelect={setSelectedDay}
   	   	   	   	month={currentMonth}
   	   	   	   	onMonthChange={setCurrentMonth}
   	   	   	   	className="rounded-md border"
   	   	   	   	components={{
   	   	   	   	   	DayContent: ({ date }) => {
   	   	   	   	   	   	const dayString = date.toDateString();
   	   	   	   	   	   	const dayFichajes = fichajesByDay[dayString];

   	   	   	   	   	   	const hasClockIn = dayFichajes?.some(f => f.type === 'Entrada');
   	   	   	   	   	   	const hasClockOut = dayFichajes?.some(f => f.type === 'Salida');
   	   	   	   	   	   	const hasBreak = dayFichajes?.some(f => f.type === 'Inicio Descanso');
   	   	   	   	   	   	const hasPendingRequest = dayFichajes?.some(f => f.requestStatus === 'pending');

   	   	   	   	   	   	return (
   	   	   	   	   	   	   	<div className="relative w-full h-full flex items-center justify-center">
   	   	   	   	   	   	   	   	<span>{date.getDate()}</span>
   	   	   	   	   	   	   	   	
   	   	   	   	   	   	   	   	{hasPendingRequest && (
   	   	   	   	   	   	   	   	   	<AlertCircle className="absolute top-1 right-1 h-3 w-3 text-yellow-500" />
   	   	   	   	   	   	   	   	)}

   	   	   	   	   	   	   	   	{(hasClockIn || hasClockOut || hasBreak) && (
   	   	   	   	   	   	   	   	   	<div className="absolute bottom-1 flex gap-1">
   	   	   	   	   	   	   	   	   	   	{hasClockIn && <ClockInIcon />}
   	   	   	   	   	   	   	   	   	   	{hasClockOut && <ClockOutIcon />}
   	   	   	   	   	   	   	   	   	   	{hasBreak && <BreakIcon />}
   	   	   	   	   	   	   	   	   	</div>
   	   	   	   	   	   	   	   	)}
   	   	   	   	   	   	   	</div>
   	   	   	   	   	   	);
   	   	   	   	   	}
   	   	   	   	}}
   	   	   	/>
   	   	   	
   	   	   	{selectedDay ? (
   	   	   	   	<EmployeeDayClocks 
   	   	   	   	   	date={selectedDay} 
   	   	   	   	   	fichajes={fichajesByDay[selectedDay.toDateString()] || []}
   	 	           	 	onViewFichaje={onViewFichaje}
   	   	   	   	/>
   	   	   	) : (
   	   	   	   	<Card>
   	   	   	   	   	<CardHeader>
   	   	   	   	   	   	<CardTitle>Detalles del día</CardTitle>
   	   	   	   	   	</CardHeader>
   	   	   	   	   	<CardContent>
   	   	   	   	   	   	<p className="text-muted-foreground">Selecciona un día en el calendario para ver los detalles de los fichajes.</p>
   	   	   	   	   	</CardContent>
   	   	   	   	</Card>
   	   	   	)}
   	   	</div>
   	);
}
