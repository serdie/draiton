

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
}
