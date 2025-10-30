
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
import { Download, Loader2, HelpCircle, Save } from 'lucide-react';
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
import { EditPayrollModal } from './edit-payroll-modal';

interface ViewPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: GeneratePayrollOutput;
  employee: Employee;
  onSaveSuccess?: () => void;
}

// Helper function to sanitize data for Firestore
const sanitizeForFirestore = (data: any): any => {
  if (data === undefined) {
    return null;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item));
  }
  if (data !== null && typeof data === 'object' && !(data instanceof Date)) {
    const sanitizedObject: { [key: string]: any } = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedObject[key] = sanitizeForFirestore(data[key]);
      }
    }
    return sanitizedObject;
  }
  return data;
};


export function ViewPayrollModal({ isOpen, onClose, payroll: initialPayroll, employee, onSaveSuccess }: ViewPayrollModalProps) {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const printableAreaRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [review, setReview] = useState<ReviewPayrollOutput | null>(null);
    const [isReviewing, setIsReviewing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPayroll, setCurrentPayroll] = useState(initialPayroll);

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
            pdf.save(`nomina-${currentPayroll.header.paymentPeriod.replace(/\s+/g, '-')}-${currentPayroll.header.employeeName}.pdf`);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            toast({ variant: 'destructive', title: 'Error de descarga', description: 'No se pudo generar el PDF.' });
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleSavePayroll = async () => {
      if (!currentPayroll || !user) return;

      setIsSaving(true);
      
      const payrollData = {
          ...currentPayroll,
          employeeId: employee.id,
          ownerId: user.uid,
          createdAt: serverTimestamp(),
      };
      
      const sanitizedData = sanitizeForFirestore(payrollData);

      try {
        await addDoc(collection(db, "payrolls"), sanitizedData);
        toast({ title: 'Nómina Guardada', description: `La nómina de ${currentPayroll.header.paymentPeriod} para ${employee.name} ha sido guardada.` });
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
        const result = await reviewPayrollAction(currentPayroll);
        if (result.data) {
            setReview(result.data);
        } else {
            toast({ variant: 'destructive', title: 'Error de revisión', description: result.error });
        }
        setIsReviewing(false);
    };

    const handleSaveEditedPayroll = (updatedPayroll: GeneratePayrollOutput) => {
        setCurrentPayroll(updatedPayroll);
        setIsEditing(false);
    }

  return (
    <>
    <EditPayrollModal 
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        payroll={currentPayroll}
        onSave={handleSaveEditedPayroll}
    />
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
                        <p className="font-bold text-base">{currentPayroll.header.companyName}</p>
                        <p>{currentPayroll.header.companyAddress}</p>
                        <p>CIF: {currentPayroll.header.companyCif}</p>
                        <p>CCC: {currentPayroll.header.contributionAccountCode}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-base">{currentPayroll.header.employeeName}</p>
                        <p>NIF/DNI: {currentPayroll.header.employeeNif}</p>
                        <p>Nº S.S.: {currentPayroll.header.employeeSocialSecurityNumber}</p>
                        <p>Categoría: {currentPayroll.header.employeeCategory}</p>
                        <p>Antigüedad: {currentPayroll.header.employeeSeniority}</p>
                    </div>
                </div>
                 <div className="flex justify-between border-b py-2 text-xs">
                     <p><span className="font-semibold">Periodo Liquidación:</span> {currentPayroll.header.paymentPeriod}</p>
                     <p><span className="font-semibold">Total Días:</span> {currentPayroll.header.totalDays}</p>
                 </div>

                {/* --- BODY --- */}
                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-black font-semibold w-[60px]">Código</TableHead>
                                <TableHead className="text-black font-semibold">Concepto</TableHead>
                                <TableHead className="text-black font-semibold text-right">Cuantía</TableHead>
                                <TableHead className="text-black font-semibold text-right">Precio</TableHead>
                                <TableHead className="text-black font-semibold text-right">Devengo</TableHead>
                                <TableHead className="text-black font-semibold text-right">Deducción</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="bg-gray-50">
                                <TableCell colSpan={6} className="font-bold text-black py-1">I. DEVENGOS</TableCell>
                            </TableRow>
                             {currentPayroll.accruals.items.map((item, index) => (
                                <TableRow key={`accrual-${index}`}>
                                    <TableCell>{item.code}</TableCell>
                                    <TableCell>{item.concept}</TableCell>
                                    <TableCell className="text-right">{item.quantity.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{item.price.toFixed(2)}€</TableCell>
                                    <TableCell className="text-right font-medium">{item.accrual?.toFixed(2)}€</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            ))}
                             <TableRow className="bg-gray-50">
                                <TableCell colSpan={6} className="font-bold text-black py-1">II. DEDUCCIONES</TableCell>
                            </TableRow>
                            {currentPayroll.deductions.items.map((item, index) => (
                                <TableRow key={`deduction-${index}`}>
                                    <TableCell>{item.code}</TableCell>
                                    <TableCell>{item.concept}</TableCell>
                                    <TableCell className="text-right">{item.quantity > 0 ? item.quantity.toFixed(2) : ''}</TableCell>
                                    <TableCell className="text-right">{item.price > 0 ? `${item.price.toFixed(2)}%` : ''}</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell className="text-right font-medium">{item.deduction?.toFixed(2)}€</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                
                {/* --- FOOTER --- */}
                 <div className="mt-4 grid grid-cols-2 gap-x-8 text-sm">
                    <div className="flex justify-between font-bold border-t pt-2">
                        <span>TOTAL DEVENGADO</span>
                        <span>{currentPayroll.summary.totalAccruals.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                        <span>TOTAL A DEDUCIR</span>
                        <span>{currentPayroll.summary.totalDeductions.toFixed(2)}€</span>
                    </div>
                </div>
                 <div className="text-lg font-bold flex justify-end mt-6 border-t-2 border-primary pt-2">
                    <div className="flex justify-between w-1/2">
                        <span>LÍQUIDO TOTAL A PERCIBIR</span>
                        <span>{currentPayroll.netPay.toFixed(2)}€</span>
                    </div>
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
            <Button variant="secondary" onClick={() => setIsEditing(true)}>Editar Nómina</Button>
            <div className="flex-grow"/>
          <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            PDF
          </Button>
          {onSaveSuccess && (
            <Button onClick={handleSavePayroll} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Guardar Nómina
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
