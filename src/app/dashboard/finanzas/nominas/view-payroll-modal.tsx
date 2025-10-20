
'use client';

import { useRef, useState } from 'react';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { type GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import type { Employee } from '../empleados/types';
import { Logo } from '@/components/logo';

interface ViewPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: GeneratePayrollOutput;
  employee: Employee;
}

export function ViewPayrollModal({ isOpen, onClose, payroll, employee }: ViewPayrollModalProps) {
    const { toast } = useToast();
    const printableAreaRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownloadPdf = async () => {
        const element = printableAreaRef.current;
        if (!element) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`nomina-${payroll.header.period}-${payroll.header.employeeName}.pdf`);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            toast({ variant: 'destructive', title: 'Error de descarga', description: 'No se pudo generar el PDF.' });
        } finally {
            setIsDownloading(false);
        }
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nómina de {payroll.header.employeeName}</DialogTitle>
          <DialogDescription>
            Detalle de la nómina para el periodo de {payroll.header.period}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mr-6 pr-6 py-4" ref={printableAreaRef}>
             <div className="p-8 border rounded-lg bg-background text-sm">
                <header className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <Logo className="h-8 w-8 mb-2 text-primary" />
                        <h2 className="font-bold">{payroll.header.companyName}</h2>
                        <p className="text-xs text-muted-foreground">{employee.companyOwnerId}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-lg">NÓMINA</h3>
                        <p className="text-muted-foreground">Periodo: {payroll.header.period}</p>
                    </div>
                </header>

                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                     <div className="space-y-1">
                        <h4 className="font-semibold mb-1">Empresa</h4>
                        <p>{payroll.header.companyName}</p>
                        <p>CIF: {employee.companyOwnerId}</p>
                     </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold mb-1">Empleado</h4>
                        <p>{payroll.header.employeeName}</p>
                        <p>NIF: {employee.nif}</p>
                        <p>Nº S.S: {employee.socialSecurityNumber}</p>
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-semibold mb-2 border-b pb-1">I. DEVENGOS</h4>
                        <Table>
                            <TableBody>
                                {payroll.accruals.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.concept}</TableCell>
                                    <TableCell className="text-right">{item.amount.toFixed(2)} €</TableCell>
                                </TableRow>
                                ))}
                                <TableRow className="font-bold">
                                    <TableCell>A. TOTAL DEVENGADO</TableCell>
                                    <TableCell className="text-right">{payroll.accruals.total.toFixed(2)} €</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 border-b pb-1">II. DEDUCCIONES</h4>
                        <Table>
                            <TableBody>
                                {payroll.deductions.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.concept}</TableCell>
                                    <TableCell className="text-right">{item.amount.toFixed(2)} €</TableCell>
                                </TableRow>
                                ))}
                                 <TableRow className="font-bold">
                                    <TableCell>B. TOTAL A DEDUCIR</TableCell>
                                    <TableCell className="text-right">{payroll.deductions.total.toFixed(2)} €</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                         <div className="text-lg font-bold flex justify-between mt-4 border-t pt-2">
                            <span>LÍQUIDO A PERCIBIR (A-B)</span>
                            <span>{payroll.netPay.toFixed(2)} €</span>
                        </div>
                    </div>
                </div>
                
                 <div className="mt-8">
                    <h4 className="font-semibold mb-2 border-b pb-1">III. DETERMINACIÓN DE LAS BASES DE COTIZACIÓN A LA S.S. Y BASE DE IRPF</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-2">
                        <div className="bg-muted p-2 rounded-md">
                            <p className="font-medium">Base Contingencias Comunes</p>
                            <p>{payroll.contributionBases.commonContingencies.toFixed(2)} €</p>
                        </div>
                        <div className="bg-muted p-2 rounded-md">
                            <p className="font-medium">Base Contingencias Profesionales</p>
                            <p>{payroll.contributionBases.professionalContingencies.toFixed(2)} €</p>
                        </div>
                        <div className="bg-muted p-2 rounded-md">
                            <p className="font-medium">Base Sujeta a Retención IRPF</p>
                            <p>{payroll.contributionBases.irpfWithholding.toFixed(2)} €</p>
                        </div>
                        <div className="bg-muted p-2 rounded-md">
                            <p className="font-medium">% Retención IRPF</p>
                            <p>{payroll.contributionBases.irpfPercentage.toFixed(2)}%</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Descargar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
