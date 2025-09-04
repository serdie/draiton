
export type Fichaje = {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'Entrada' | 'Salida';
    timestamp: Date;
}
