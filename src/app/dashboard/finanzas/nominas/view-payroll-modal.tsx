
'use client';

import { useContext, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';
import type { Employee } from './page';
import { AuthContext } from '@/context/auth-context';
import type { GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ViewPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  payroll: GeneratePayrollOutput;
}

export function ViewPayrollModal({ isOpen, onClose, employee, payroll }: ViewPayrollModalProps) {
  const { user } = useContext(AuthContext);
  const company = user?.company;
  const { toast } = useToast();
  const printableAreaRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    const element = printableAreaRef.current;
    if (!element) return;
    
    setIsDownloading(true);
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps= pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`nomina-${payroll.header.period.replace(' ', '-')}-${employee.name.replace(' ', '-')}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
            variant: 'destructive',
            title: 'Error de Descarga',
            description: 'No se pudo generar el PDF. Inténtalo de nuevo.',
        });
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nómina de {employee.name} - {payroll.header.period}</DialogTitle>
          <DialogDescription>
            Detalles de la nómina para el periodo de liquidación seleccionado.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-4 text-sm py-4">
            
            <div ref={printableAreaRef} className="p-6 bg-background text-foreground">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <Logo className="h-10 w-10 mb-2"/>
                        <h2 className="font-bold text-lg">{company?.name || 'Tu Empresa S.L.'}</h2>
                        <p>{company?.cif}</p>
                        <p className="max-w-xs">{company?.address}</p>
                    </div>
                    <div className="text-right">
                        <h1 className="font-bold text-2xl uppercase">NÓMINA</h1>
                        <p>Periodo: {payroll.header.period}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg mb-6">
                    <div>
                        <h3 className="font-semibold">Empresa</h3>
                        <p>{company?.name}</p>
                        <p>CIF: {company?.cif}</p>
                        <p>CCC: {payroll.header.companyName === 'Emprende Total SL' ? '28/123456789' : payroll.header.companyName}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Empleado</h3>
                        <p>{employee.name}</p>
                        <p>NIF: {employee.nif}</p>
                        <p>Nº S.S.: {employee.socialSecurityNumber}</p>
                    </div>
                </div>

                {/* Accruals */}
                <div className="border rounded-lg mb-6">
                    <h4 className="font-medium text-base p-3 bg-muted rounded-t-lg">I. DEVENGOS</h4>
                    <div className="p-3 space-y-1">
                        {payroll.accruals.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{item.concept}</span>
                                <span className="font-mono">{item.amount.toFixed(2)}€</span>
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold p-3">
                        <span>A. TOTAL DEVENGADO</span>
                        <span className="font-mono">{payroll.accruals.total.toFixed(2)}€</span>
                    </div>
                </div>

                {/* Deductions */}
                <div className="border rounded-lg mb-6">
                    <h4 className="font-medium text-base p-3 bg-muted rounded-t-lg">II. DEDUCCIONES</h4>
                    <div className="p-3 space-y-1">
                        {payroll.deductions.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{item.concept}</span>
                                <span className="font-mono">{item.amount.toFixed(2)}€</span>
                            </div>
                        ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold p-3">
                        <span>B. TOTAL A DEDUCIR</span>
                        <span className="font-mono">{payroll.deductions.total.toFixed(2)}€</span>
                    </div>
                </div>

                <div className="p-4 bg-primary/10 text-primary rounded-lg flex justify-between items-center font-bold text-lg mb-6">
                    <span>LÍQUIDO TOTAL A PERCIBIR (A - B)</span>
                    <span className="font-mono">{payroll.netPay.toFixed(2)}€</span>
                </div>

                {/* Contribution Bases */}
                <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-base mb-2">BASES DE COTIZACIÓN Y RETENCIÓN IRPF</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">Contingencias Comunes:</span> <span className="font-mono">{payroll.contributionBases.commonContingencies.toFixed(2)}€</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Contingencias Profesionales:</span> <span className="font-mono">{payroll.contributionBases.professionalContingencies.toFixed(2)}€</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Base IRPF:</span> <span className="font-mono">{payroll.contributionBases.irpfWithholding.toFixed(2)}€</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Porcentaje IRPF:</span> <span className="font-mono">{payroll.contributionBases.irpfPercentage.toFixed(2)}%</span></div>
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handleDownloadPdf} disabled={isDownloading}>
             {isDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDownloading ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
