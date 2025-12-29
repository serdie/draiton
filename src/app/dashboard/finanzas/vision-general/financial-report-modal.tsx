
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type ReportType = 'p&g' | 'balance' | 'cashflow';

interface FinancialReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType | null;
}

const reportTitles: Record<ReportType, string> = {
    'p&g': 'Balance de Pérdidas y Ganancias',
    'balance': 'Balance de Situación',
    'cashflow': 'Estado de Flujo de Caja'
}

// Mock Data
const pgData = [
    { item: '(+) Importe neto de la cifra de negocios', value: '25,000.00€', isBold: false },
    { item: '(-) Aprovisionamientos', value: '-8,000.00€', isBold: false },
    { item: '(+) Otros ingresos de explotación', value: '500.00€', isBold: false },
    { item: '(-) Gastos de personal', value: '-6,000.00€', isBold: false },
    { item: '(-) Otros gastos de explotación', value: '-2,500.00€', isBold: false },
    { item: '(=) RESULTADO DE EXPLOTACIÓN', value: '9,000.00€', isBold: true },
    { item: '(+) Ingresos financieros', value: '100.00€', isBold: false },
    { item: '(-) Gastos financieros', value: '-200.00€', isBold: false },
    { item: '(=) RESULTADO FINANCIERO', value: '-100.00€', isBold: true },
    { item: '(=) RESULTADO ANTES DE IMPUESTOS', value: '8,900.00€', isBold: true },
    { item: '(-) Impuesto sobre beneficios', value: '-1,780.00€', isBold: false },
    { item: '(=) RESULTADO DEL EJERCICIO', value: '7,120.00€', isBold: true, isFinal: true },
];

const balanceData = {
    activos: [
        { item: 'Activo no corriente', value: '15,000.00€' },
        { item: 'Activo corriente', value: '10,000.00€' },
    ],
    pasivos: [
        { item: 'Patrimonio neto', value: '12,000.00€' },
        { item: 'Pasivo no corriente', value: '8,000.00€' },
        { item: 'Pasivo corriente', value: '5,000.00€' },
    ]
}

const cashflowData = [
    { item: 'Flujo de caja de las actividades de explotación', value: '10,000.00€' },
    { item: 'Flujo de caja de las actividades de inversión', value: '-5,000.00€' },
    { item: 'Flujo de caja de las actividades de financiación', value: '2,000.00€' },
    { item: 'Aumento/disminución neta del efectivo', value: '7,000.00€', isBold: true },
];

export function FinancialReportModal({ isOpen, onClose, reportType }: FinancialReportModalProps) {
    const { toast } = useToast();
    const printableAreaRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        const element = printableAreaRef.current;
        if (!element || !reportType) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${reportTitles[reportType].replace(/ /g, '_')}.pdf`);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            toast({ variant: 'destructive', title: 'Error de descarga', description: 'No se pudo generar el PDF.' });
        } finally {
            setIsDownloading(false);
        }
    };

    if (!isOpen || !reportType) return null;

    const renderContent = () => {
        switch (reportType) {
            case 'p&g':
                return (
                    <Table>
                        <TableBody>
                            {pgData.map((row, index) => (
                                <TableRow key={index} className={row.isFinal ? 'bg-primary/10' : ''}>
                                    <TableCell className={row.isBold ? 'font-bold' : ''}>{row.item}</TableCell>
                                    <TableCell className={`text-right ${row.isBold ? 'font-bold' : ''}`}>{row.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            case 'balance':
                return (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Activos</h3>
                            <Table>
                                <TableBody>
                                    {balanceData.activos.map((row, index) => (
                                        <TableRow key={index}><TableCell>{row.item}</TableCell><TableCell className="text-right">{row.value}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Pasivos y Patrimonio Neto</h3>
                             <Table>
                                <TableBody>
                                    {balanceData.pasivos.map((row, index) => (
                                        <TableRow key={index}><TableCell>{row.item}</TableCell><TableCell className="text-right">{row.value}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                );
            case 'cashflow':
                 return (
                    <Table>
                        <TableBody>
                            {cashflowData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className={row.isBold ? 'font-bold' : ''}>{row.item}</TableCell>
                                    <TableCell className={`text-right ${row.isBold ? 'font-bold' : ''}`}>{row.value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{reportTitles[reportType]}</DialogTitle>
                    <DialogDescription>
                        Informe generado para el periodo actual. Los datos son de ejemplo.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-6 -mr-6 py-4" ref={printableAreaRef}>
                    <div className="p-2">
                       {renderContent()}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cerrar</Button>
                    <Button onClick={handleDownloadPdf} disabled={isDownloading}>
                        {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        {isDownloading ? 'Generando...' : 'Descargar PDF'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

