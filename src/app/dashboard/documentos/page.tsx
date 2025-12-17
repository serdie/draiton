'use client';

import { DocumentosContent } from './documentos-content';
import { type Address } from '@/lib/firebase/user-settings-actions';

export type DocumentType = 'factura' | 'presupuesto' | 'nota-credito' | 'recurrente';
export type DocumentStatus = 'Pagado' | 'Pendiente' | 'Vencido' | 'Enviado' | 'Aceptado' | 'Rechazado' | 'Emitido' | 'Aplicado' | 'Borrador' | 'Activo' | 'Pausado' | 'Impagada';

export type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
};

export type Document = {
  id: string;
  ownerId: string;
  cliente: string;
  clienteCif?: string;
  clienteDireccion?: Address;
  clienteEmail?: string;
  showClientEmail?: boolean;
  clienteTelefono?: string;
  showClientPhone?: boolean;
  emisorEmail?: string;
  showEmisorEmail?: boolean;
  emisorTelefono?: string;
  showEmisorPhone?: boolean;
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
  terminos?: string;
  iban?: string;

  // --- Campos nuevos para Veri*factu ---
  verifactuStatus?: 'pending' | 'sent' | 'error';
  verifactuQR?: string;
  verifactuChainHash?: string;
  verifactuCSV?: string;
  verifactuDate?: string;
};

export default function DocumentosPage() {
  return <DocumentosContent />;
}