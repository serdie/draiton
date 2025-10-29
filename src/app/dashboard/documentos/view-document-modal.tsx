
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
import { Printer, QrCode, Download, Loader2, Landmark, FileText, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/context/auth-context';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';
import Image from 'next/image';


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
    case 'impagada':
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
  
  if (!isOpen || !document || !user) return null;


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
             <div ref={printableAreaRef} id="printable-area" className="p-8 bg-white text-black text-sm">
                 <header style={{ borderTop: `4px solid ${companyData?.brandColor || 'hsl(var(--primary))'}` }} className="grid grid-cols-2 gap-8 mb-8 pb-4 border-b">
                    <div className="flex items-center">
                        {companyData?.logoUrl ? (
                            <Image src={companyData.logoUrl} alt="Logo de la empresa" width={120} height={60} className="object-contain" />
                        ) : (
                            <div className="w-24 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <h2 className="font-bold text-lg">{companyData?.name || 'Tu Empresa S.L.'}</h2>
                        <p className="text-xs text-gray-600">{companyData?.address || 'Tu Dirección, Ciudad, País'}</p>
                        <p className="text-xs text-gray-600">CIF: {companyData?.cif || 'Y12345672'}</p>
                    </div>
                 </header>

                <div className="grid grid-cols-2 gap-8 mb-8">
                     <div className="space-y-1">
                        <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-2">Factura a:</h3>
                        <p className="font-bold text-base">{document.cliente}</p>
                        <p className="text-gray-600 whitespace-pre-wrap">{document.clienteDireccion}</p>
                        {document.clienteCif && <p className="text-gray-600">CIF/NIF: {document.clienteCif}</p>}
                    </div>
                     <div className="space-y-2 text-right">
                        <div className="grid grid-cols-2">
                            <span className="font-semibold text-gray-500">Nº Factura:</span>
                            <span className="font-medium">{document.numero}</span>
                        </div>
                        <div className="grid grid-cols-2">
                            <span className="font-semibold text-gray-500">Fecha Emisión:</span>
                            <span className="font-medium">{format(document.fechaEmision, "dd/MM/yyyy", { locale: es })}</span>
                        </div>
                         {document.fechaVto && (
                            <div className="grid grid-cols-2">
                                <span className="font-semibold text-gray-500">Fecha Vencimiento:</span>
                                <span className="font-medium">{format(document.fechaVto, "dd/MM/yyyy", { locale: es })}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-b border-t">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="text-black font-semibold">Descripción</TableHead>
                                <TableHead className="text-center text-black font-semibold">Cantidad</TableHead>
                                <TableHead className="text-right text-black font-semibold">P. Unitario</TableHead>
                                <TableHead className="text-right text-black font-semibold">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {document.lineas && document.lineas.map((line, index) => (
                                <TableRow key={index} className="border-b">
                                    <TableCell className="font-medium whitespace-pre-wrap py-3">{line.description}</TableCell>
                                    <TableCell className="text-center py-3">{line.quantity} {line.unit !== 'cantidad' ? line.unit : ''}</TableCell>
                                    <TableCell className="text-right py-3">{line.unitPrice.toFixed(2)} {document.moneda}</TableCell>
                                    <TableCell className="text-right font-medium py-3">{line.total.toFixed(2)} {document.moneda}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                 <div className="flex justify-end pt-8">
                    <div className="w-full max-w-sm space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span>{document.subtotal.toFixed(2)} {document.moneda}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">IVA</span>
                            <span>{document.impuestos.toFixed(2)} {document.moneda}</span>
                        </div>
                        <Separator className="bg-gray-300 my-2"/>
                        <div className="flex justify-between text-lg font-bold">
                            <span>TOTAL</span>
                            <span>{document.importe.toFixed(2)} {document.moneda}</span>
                        </div>
                    </div>
                </div>
                
                 <footer className="border-t mt-12 pt-6 space-y-6 text-xs text-gray-500">
                    {document.iban && (
                        <div className="space-y-1">
                            <h4 className="font-semibold text-black text-sm flex items-center gap-2 mb-1"><Landmark className="h-4 w-4"/> Forma de pago</h4>
                            <p>Transferencia bancaria a la cuenta:</p>
                            <p className="font-mono text-black">{document.iban}</p>
                        </div>
                    )}
                     {document.terminos && (
                        <div className="space-y-1">
                            <h4 className="font-semibold text-black text-sm flex items-center gap-2 mb-1"><FileText className="h-4 w-4"/> Términos y condiciones</h4>
                            <p className="whitespace-pre-wrap">{document.terminos}</p>
                        </div>
                    )}
                </footer>
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
