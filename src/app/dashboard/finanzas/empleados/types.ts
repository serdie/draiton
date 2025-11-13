
'use client';

import type { Timestamp } from 'firebase/firestore';

export type Employee = {
    id: string;
    ownerId: string;
    name: string;
    email: string;
    phone?: string;
    position: string;
    nif: string;
    socialSecurityNumber: string;
    contractType: 'Indefinido' | 'Temporal' | 'Formación' | 'Prácticas';
    workModality: 'Presencial' | 'Mixto' | 'Teletrabajo';
    presencialPercentage?: number;
    remotePercentage?: number;
    paymentFrequency: 'Mensual' | 'Diario' | 'Semanal' | 'Quincenal' | 'Personalizar';
    grossAnnualSalary: number;
    weeklyHours?: number;
    proratedExtraPays: boolean;
    hireDate?: Date;
    avatar?: string;
    employeePortalActive?: boolean;
    employeePortalId?: string;
    rgpdTrainingProgress?: number;
    rgpdTrainingCompletedAt?: Timestamp;
    rgpdTrainingSignature?: {
        name: string;
        nif: string;
    };
};

export type BreakDetails = {
    isSplitShift: boolean;
    isPersonal: boolean;
    isJustified: boolean;
    justificationType?: 'Visita medica' | 'Tratamiento' | 'Gestiones administrativas' | 'Tutoria' | 'Otros';
    moreInfo?: string;
}

export type Fichaje = {
    id: string;
    employeeId: string;
    employeeName: string;
    ownerId: string;
    type: 'Entrada' | 'Salida' | 'Inicio Descanso' | 'Fin Descanso';
    timestamp: Date;
    requestChangeReason?: string;
    requestedTimestamp?: Date;
    requestStatus?: 'pending' | 'approved' | 'rejected';
    requestedAt?: Date;
    requesterId?: string;
    requesterName?: string;
    breakDetails?: BreakDetails;
    workModality?: 'Presencial' | 'Teletrabajo';
}

export type AbsenceType = 'Vacaciones' | 'Baja por enfermedad' | 'Paternidad/Maternidad' | 'Día propio' | 'Festivo' | 'Otro';
export type AbsenceStatus = 'Aprobada' | 'Pendiente' | 'Rechazada';

export interface Absence {
  id: string;
  employeeId: string;
  ownerId: string;
  type: AbsenceType;
  startDate: Date;
  endDate: Date;
  status: AbsenceStatus;
  notes?: string;
  createdAt: Date;
}
