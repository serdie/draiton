

export type Fichaje = {
    id: string;
    employeeId: string;
    employeeName: string;
    ownerId: string;
    type: 'Entrada' | 'Salida';
    timestamp: Date;
}
