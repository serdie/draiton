
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
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Download, Loader2, HelpCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { type GeneratePayrollOutput, type ReviewPayrollOutput } from '@/ai/schemas/payroll-schemas';
import type { Employee } from '../empleados/types';
import { Logo } from '@/components/logo';
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
  onSaveSuccess: () => void;
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
            pdf.save(`nomina-${payroll.header.period}-${payroll.header.employeeName}.pdf`);
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
        toast({ title: 'Nómina Guardada', description: `La nómina de ${payroll.header.period} para ${employee.name} ha sido guardada.` });
        onSaveSuccess();
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Borrador de Nómina</DialogTitle>
          <DialogDescription>
            Revisa la nómina generada para {employee.name} en el periodo {payroll.header.period}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto" ref={printableAreaRef}>
             <div className="p-6 border rounded-lg bg-background text-sm">
                <h3 className="text-center font-bold text-lg mb-6">Nómina para {payroll.header.period}</h3>
                
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-base mb-2 border-b pb-1">I. DEVENGOS</h4>
                        <Table>
                            <TableBody>
                                {payroll.accruals.items.map((item, index) => (
                                <TableRow key={index} className="border-none">
                                    <TableCell className="py-1">{item.concept}</TableCell>
                                    <TableCell className="text-right py-1">{item.amount.toFixed(2)}€</TableCell>
                                </TableRow>
                                ))}
                                <TableRow className="font-bold border-t">
                                    <TableCell className="py-2">A. TOTAL DEVENGADO</TableCell>
                                    <TableCell className="text-right py-2">{payroll.accruals.total.toFixed(2)}€</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                     <div>
                        <h4 className="font-semibold text-base mb-2 border-b pb-1">II. DEDUCCIONES</h4>
                        <Table>
                            <TableBody>
                                {payroll.deductions.items.map((item, index) => (
                                <TableRow key={index} className="border-none">
                                    <TableCell className="py-1">{item.concept}</TableCell>
                                    <TableCell className="text-right py-1">{item.amount.toFixed(2)}€</TableCell>
                                </TableRow>
                                ))}
                                 <TableRow className="font-bold border-t">
                                    <TableCell className="py-2">B. TOTAL A DEDUCIR</TableCell>
                                    <TableCell className="text-right py-2">{payroll.deductions.total.toFixed(2)}€</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
                
                 <div className="text-lg font-bold text-primary flex justify-between mt-6 border-t-2 border-primary pt-2">
                    <span>LÍQUIDO TOTAL A PERCIBIR (A - B)</span>
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
          <Button onClick={handleSavePayroll} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Guardar Nómina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
