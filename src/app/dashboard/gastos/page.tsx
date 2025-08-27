
'use client';

import { GastosContent } from './gastos-content';

export type Expense = {
    id: string;
    ownerId: string;
    fecha: Date;
    categoria: string;
    proveedor: string;
    descripcion: string;
    importe: number;
    metodoPago: string;
    fechaCreacion: Date;
};

export default function GastosPage() {
    return <GastosContent />;
}
