

'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { WorkSchedule, WorkDay, WorkDayType } from '../types';
import { differenceInMinutes, parse } from 'date-fns';


export const calculateTotalHours = (schedule?: WorkSchedule): number => {
    if (!schedule) return 0;
    let totalMinutes = 0;

    Object.values(schedule).forEach(day => {
        if (day.type !== 'no-laboral' && day.timeSlots) {
            day.timeSlots.forEach(slot => {
                if (slot.start && slot.end) {
                    try {
                        const start = parse(slot.start, 'HH:mm', new Date());
                        const end = parse(slot.end, 'HH:mm', new Date());
                        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                            const diff = differenceInMinutes(end, start);
                            if (diff > 0) {
                                totalMinutes += diff;
                            }
                        }
                    } catch (e) {
                        // Ignore parsing errors for now
                    }
                }
            });
        }
    });

    return totalMinutes / 60;
};


interface WorkScheduleFormProps {
  initialSchedule?: WorkSchedule;
  onChange: (schedule: WorkSchedule) => void;
}

const defaultDay: WorkDay = {
  type: 'no-laboral',
  timeSlots: [],
};

const defaultSchedule: WorkSchedule = {
  monday: { type: 'continua', timeSlots: [{ start: '09:00', end: '17:00' }] },
  tuesday: { type: 'continua', timeSlots: [{ start: '09:00', end: '17:00' }] },
  wednesday: { type: 'continua', timeSlots: [{ start: '09:00', end: '17:00' }] },
  thursday: { type: 'continua', timeSlots: [{ start: '09:00', end: '17:00' }] },
  friday: { type: 'continua', timeSlots: [{ start: '09:00', end: '15:00' }] },
  saturday: { type: 'no-laboral', timeSlots: [] },
  sunday: { type: 'no-laboral', timeSlots: [] },
};

const daysOfWeek: (keyof WorkSchedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels: { [key in keyof WorkSchedule]: string } = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export function WorkScheduleForm({ initialSchedule, onChange }: WorkScheduleFormProps) {
  const [schedule, setSchedule] = useState<WorkSchedule>(initialSchedule || defaultSchedule);

  useEffect(() => {
    onChange(schedule);
  }, [schedule, onChange]);
  
  const handleDayTypeChange = (day: keyof WorkSchedule, type: WorkDayType) => {
    setSchedule(prev => {
        const newSchedule = { ...prev };
        if (type === 'no-laboral') {
            newSchedule[day] = { type, timeSlots: [] };
        } else if (type === 'continua') {
            newSchedule[day] = { type, timeSlots: [{ start: '09:00', end: '17:00' }] };
        } else if (type === 'partida') {
            newSchedule[day] = { type, timeSlots: [{ start: '09:00', end: '13:00' }, { start: '15:00', end: '19:00' }] };
        }
        return newSchedule;
    });
  };
  
  const handleTimeChange = (day: keyof WorkSchedule, slotIndex: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => {
        const newSchedule = { ...prev };
        newSchedule[day].timeSlots[slotIndex][field] = value;
        return newSchedule;
    })
  }

  return (
    <div className="space-y-4">
      {daysOfWeek.map(day => (
        <div key={day} className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-semibold">{dayLabels[day]}</Label>
            <Select value={schedule[day]?.type || 'no-laboral'} onValueChange={(value: WorkDayType) => handleDayTypeChange(day, value)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="no-laboral">No laboral</SelectItem>
                    <SelectItem value="continua">Jornada continua</SelectItem>
                    <SelectItem value="partida">Jornada partida</SelectItem>
                </SelectContent>
            </Select>
          </div>
          
          {schedule[day]?.type !== 'no-laboral' && (
             <div className="space-y-2 pl-4 border-l-2 ml-2">
                {schedule[day].timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Label className="text-xs w-12">{index === 0 ? 'Turno 1' : 'Turno 2'}</Label>
                        <Input 
                            type="time" 
                            value={slot.start} 
                            onChange={(e) => handleTimeChange(day, index, 'start', e.target.value)}
                        />
                        <span>-</span>
                        <Input 
                            type="time" 
                            value={slot.end}
                             onChange={(e) => handleTimeChange(day, index, 'end', e.target.value)}
                        />
                    </div>
                ))}
             </div>
          )}

        </div>
      ))}
    </div>
  );
}

