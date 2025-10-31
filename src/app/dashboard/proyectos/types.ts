

export type Fichaje = {
    id: string;
    employeeId: string;
    employeeName: string;
    ownerId: string;
    type: 'Entrada' | 'Salida' | 'Inicio Descanso' | 'Fin Descanso';
    timestamp: Date;
    requestChangeReason?: string;
}
