
'use client';

import { DocumentosContent } from './documentos-content';

export type DocumentType = 'factura' | 'presupuesto' | 'nota-credito' | 'recurrente';
export type DocumentStatus = 'Pagado' | 'Pendiente' | 'Vencido' | 'Enviado' | 'Aceptado' | 'Rechazado' | 'Emitido' | 'Aplicado' | 'Borrador' | 'Activo' | 'Pausado' | 'Impagada';

export type LineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type Document = {
  id: string;
  ownerId: string;
  cliente: string;
  clienteCif?: string;
  clienteDireccion?: string;
  tipo: DocumentType;
  importe: number;
  subtotal: number;
  impuestos: number;
  estado: DocumentStatus;
  fechaEmision: Date;
  fechaVto: Date | null;
  numero: string;
  lineas: LineItem[];
  moneda: string;
};

export default function DocumentosPage() {
  return <DocumentosContent />;
}
