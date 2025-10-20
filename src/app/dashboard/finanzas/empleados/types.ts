
import type { Employee as BaseEmployee } from './page';

export type Fichaje = {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'Entrada' | 'Salida';
    timestamp: Date;
}

export type Employee = BaseEmployee & {
    avatar?: string;
}
