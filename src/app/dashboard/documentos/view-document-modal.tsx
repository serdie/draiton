
'use client';

import { useContext, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Document, DocumentType, DocumentStatus } from './page';
import { cn } from '@/lib/utils';
import { Printer, QrCode, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/context/auth-context';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';


interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
}

const getBadgeClass = (estado?: DocumentStatus) => {
  switch (estado?.toLowerCase()) {
    case 'pagado':
    case 'aceptado':
    case 'aplicado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pendiente':
    case 'enviado':
    case 'emitido':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'vencido':
    case 'rechazado':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDocumentTypeLabel = (type?: DocumentType) => {
    switch (type) {
        case 'factura': return 'Factura';
        case 'presupuesto': return 'Presupuesto';
        case 'nota-credito': return 'Nota de Crédito';
        case 'recurrente': return 'Factura Recurrente';
    }
}

export function ViewDocumentModal({ isOpen, onClose, document }: ViewDocumentModalProps) {
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const companyData = user?.company;
  const printableAreaRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);


  const handleDownloadPdf = async () => {
    const element = printableAreaRef.current;
    if (!element || !document) return;
    setIsDownloading(true);

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            height: element.scrollHeight,
            windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        const docTypeLabel = getDocumentTypeLabel(document.tipo) || 'Documento';
        pdf.save(`${docTypeLabel}-${document.numero}.pdf`);

    } catch (error) {
        console.error("Error al generar el PDF:", error);
        toast({
            variant: 'destructive',
            title: 'Error en la Descarga',
            description: 'No se pudo generar el PDF. Inténtalo de nuevo.',
        });
    } finally {
        setIsDownloading(false);
    }
  };
  
  if (!isOpen || !document) return null;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col @container">
        <DialogHeader className="px-6 pt-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <DialogTitle>
                        {getDocumentTypeLabel(document.tipo)}: {document.numero}
                    </DialogTitle>
                     <DialogDescription>
                        Vista previa del documento emitido para <span className="font-semibold">{document.cliente}</span>.
                    </DialogDescription>
                </div>
                 <div className="flex justify-start pt-2">
                     <Badge variant="outline" className={cn('text-base', getBadgeClass(document.estado))}>{document.estado}</Badge>
                </div>
            </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-2 -mr-6 py-4 space-y-6 bg-background">
             <div ref={printableAreaRef} id="printable-area" className="p-6">
                 <div className="grid grid-cols-1 @lg:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-base">Emisor</h3>
                        <p className="font-bold">{companyData?.name || 'Tu Empresa S.L.'}</p>
                        <p>{companyData?.cif || 'Y12345672'}</p>
                        <p>{companyData?.address || 'Tu Dirección, Ciudad, País'}</p>
                    </div>
                    <div className="flex flex-col items-start @lg:items-end gap-4">
                        <div className="text-center text-muted-foreground">
                            <QrCode className="h-20 w-20 mx-auto text-foreground" />
                            <p className="text-xs font-semibold mt-1">Factura Electronica</p>
                        </div>
                         <div className="space-y-1 @lg:text-right">
                            <h3 className="font-semibold text-base">Cliente</h3>
                            <p className="font-bold">{document.cliente}</p>
                            <p>{document.clienteCif}</p>
                            <p>{document.clienteDireccion}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 @md:grid-cols-4 gap-4 rounded-lg border p-4 my-6">
                    <div>
                        <p className="text-muted-foreground">Nº Documento</p>
                        <p className="font-semibold">{document.numero}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Fecha Emisión</p>
                        <p className="font-semibold">{format(document.fechaEmision, "dd/MM/yyyy", { locale: es })}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Fecha Vencimiento</p>
                        <p className="font-semibold">{document.fechaVto ? format(document.fechaVto, "dd/MM/yyyy", { locale: es }) : 'N/A'}</p>
                    </div>
                </div>

                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-center">Cant.</TableHead>
                                <TableHead className="text-right">P. Unitario</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {document.lineas && document.lineas.map((line, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{line.description}</TableCell>
                                    <TableCell className="text-center">{line.quantity}</TableCell>
                                    <TableCell className="text-right">{line.unitPrice.toFixed(2)} {document.moneda}</TableCell>
                                    <TableCell className="text-right">{line.total.toFixed(2)} {document.moneda}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                <div className="flex justify-end items-end pt-8">
                    <div className="w-full max-w-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{document.subtotal.toFixed(2)} {document.moneda}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Impuestos</span>
                            <span>{document.impuestos.toFixed(2)} {document.moneda}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-base font-bold">
                            <span>Total</span>
                            <span>{document.importe.toFixed(2)} {document.moneda}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter className="print:hidden p-6 border-t">
            <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                {isDownloading ? 'Generando...' : 'Descargar PDF'}
            </Button>
            <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
