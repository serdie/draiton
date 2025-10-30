
'use client';

import { useRef, useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow, TableHeader, TableHead } from '@/components/ui/table';
import { Download, Loader2, HelpCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { type GeneratePayrollOutput, type ReviewPayrollOutput } from '@/ai/schemas/payroll-schemas';
import type { Employee } from '../empleados/types';
import { reviewPayrollAction } from './actions';
import { AuthContext } from '@/context/auth-context';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ViewPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: GeneratePayrollOutput;
  employee: Employee;
  onSaveSuccess?: () => void;
}

export function ViewPayrollModal({ isOpen, onClose, payroll, employee, onSaveSuccess }: ViewPayrollModalProps) {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const printableAreaRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [review, setReview] = useState<ReviewPayrollOutput | null>(null);
    const [isReviewing, setIsReviewing] = useState(false);

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
            pdf.save(`nomina-${payroll.header.paymentPeriod.replace(/\s+/g, '-')}-${payroll.header.employeeName}.pdf`);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            toast({ variant: 'destructive', title: 'Error de descarga', description: 'No se pudo generar el PDF.' });
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleSavePayroll = async () => {
      if (!payroll || !user) return;

      setIsSaving(true);
      
      const payrollData = {
          ...payroll,
          employeeId: employee.id,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, "payrolls"), payrollData);
        toast({ title: 'Nómina Guardada', description: `La nómina de ${payroll.header.paymentPeriod} para ${employee.name} ha sido guardada.` });
        if(onSaveSuccess) onSaveSuccess();
      } catch (error) {
        console.error("Error al guardar la nómina:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la nómina en la base de datos.' });
      } finally {
        setIsSaving(false);
      }
    }
    
    const handleReview = async () => {
        setIsReviewing(true);
        setReview(null);
        const result = await reviewPayrollAction(payroll);
        if (result.data) {
            setReview(result.data);
        } else {
            toast({ variant: 'destructive', title: 'Error de revisión', description: result.error });
        }
        setIsReviewing(false);
    };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Borrador de Nómina</DialogTitle>
          <DialogDescription>
            Revisa la nómina generada para {employee.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mr-6 pr-6 py-4" ref={printableAreaRef}>
             <div className="p-6 border rounded-lg bg-background text-sm text-black">
                {/* --- HEADER --- */}
                <div className="grid grid-cols-2 gap-4 border-b pb-4 text-xs">
                    <div>
                        <p className="font-bold text-base">{payroll.header.companyName}</p>
                        <p>{payroll.header.companyAddress}</p>
                        <p>CIF: {payroll.header.companyCif}</p>
                        <p>CCC: {payroll.header.contributionAccountCode}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-base">{payroll.header.employeeName}</p>
                        <p>NIF/DNI: {payroll.header.employeeNif}</p>
                        <p>Nº S.S.: {payroll.header.employeeSocialSecurityNumber}</p>
                        <p>Categoría: {payroll.header.employeeCategory}</p>
                        <p>Antigüedad: {payroll.header.employeeSeniority}</p>
                    </div>
                </div>
                 <div className="flex justify-between border-b py-2 text-xs">
                     <p><span className="font-semibold">Periodo Liquidación:</span> {payroll.header.paymentPeriod}</p>
                     <p><span className="font-semibold">Total Días:</span> {payroll.header.totalDays}</p>
                 </div>

                {/* --- BODY --- */}
                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-black w-1/12">Cód.</TableHead>
                                <TableHead className="text-black w-5/12">Concepto</TableHead>
                                <TableHead className="text-black text-center w-1/12">Cuantía</TableHead>
                                <TableHead className="text-black text-right w-2/12">Precio</TableHead>
                                <TableHead className="text-black text-right w-2/12">Devengos</TableHead>
                                <TableHead className="text-black text-right w-2/12">Deducciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payroll.body.items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-mono text-xs">{item.code}</TableCell>
                                <TableCell>{item.concept}</TableCell>
                                <TableCell className="text-center">{item.quantity.toFixed(2)}</TableCell>
                                <TableCell className="text-right">{item.price.toFixed(2)}€</TableCell>
                                <TableCell className="text-right font-medium">{item.accrual?.toFixed(2)}€</TableCell>
                                <TableCell className="text-right font-medium">{item.deduction?.toFixed(2)}€</TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                {/* --- FOOTER --- */}
                 <div className="mt-4 grid grid-cols-4 gap-2 text-xs border-t pt-2">
                    <div className="font-bold">Totales</div>
                    <div></div>
                    <div className="text-right font-bold">{payroll.summary.totalAccruals.toFixed(2)}€</div>
                    <div className="text-right font-bold">{payroll.summary.totalDeductions.toFixed(2)}€</div>
                </div>
                 <div className="text-lg font-bold flex justify-between mt-6 border-t-2 border-primary pt-2">
                    <span>LÍQUIDO TOTAL A PERCIBIR</span>
                    <span>{payroll.netPay.toFixed(2)}€</span>
                </div>
            </div>
            
            {review && (
                <div className="mt-4 space-y-3">
                    <h3 className="font-semibold">Revisión con IA</h3>
                     {review.explanations.map((exp, index) => (
                        <Alert key={index}>
                           <AlertTitle className="font-semibold">{exp.concept}</AlertTitle>
                           <AlertDescription>{exp.explanation}</AlertDescription>
                        </Alert>
                    ))}
                </div>
            )}
        </div>

        <DialogFooter className="items-center">
            <Button variant="ghost" onClick={handleReview} disabled={isReviewing}>
                {isReviewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <HelpCircle className="mr-2 h-4 w-4"/>}
                {isReviewing ? 'Revisando...' : 'Revisión con IA'}
            </Button>
            <div className="flex-grow"/>
          <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            PDF
          </Button>
          {onSaveSuccess && (
            <Button onClick={handleSavePayroll} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Nómina
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
