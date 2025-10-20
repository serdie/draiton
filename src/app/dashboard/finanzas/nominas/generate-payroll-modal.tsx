
'use client';

import { useState, useContext, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Wand2, FileSignature, AlertCircle, Terminal, Download, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/context/auth-context';
import { generatePayroll, reviewPayroll } from './actions';
import { type Employee } from '../empleados/types';
import type { GeneratePayrollOutput, ReviewPayrollOutput } from '@/ai/schemas/payroll-schemas';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ViewPayrollModal } from './view-payroll-modal';
import { EditPayrollModal } from './edit-payroll-modal';
import { nanoid } from 'nanoid';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const currentYear = new Date().getFullYear();

export function GeneratePayrollModal({ isOpen, onClose, employee }: GeneratePayrollModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [period, setPeriod] = useState(`${months[new Date().getMonth()]} ${currentYear}`);
  const [generatedPayroll, setGeneratedPayroll] = useState<GeneratePayrollOutput | null>(null);
  const [payrollToView, setPayrollToView] = useState<GeneratePayrollOutput | null>(null);
  const [payrollToEdit, setPayrollToEdit] = useState<GeneratePayrollOutput | null>(null);


  const handleGenerate = async () => {
    if (!user || !user.company) {
      toast({ variant: 'destructive', title: 'Error', description: 'Faltan datos de la empresa en tu configuración.' });
      return;
    }
    setIsGenerating(true);
    setGeneratedPayroll(null);

    const input = {
        employeeName: employee.name,
        nif: employee.nif,
        socialSecurityNumber: employee.socialSecurityNumber,
        contractType: employee.contractType,
        professionalGroup: 'Grupo 1 - Ingenieros y Licenciados', // Placeholder
        grossAnnualSalary: employee.grossAnnualSalary,
        paymentPeriod: period,
        companyName: user.company.name || 'Nombre Empresa no configurado',
        cif: user.company.cif || 'CIF no configurado',
        contributionAccountCode: '28/1234567/89', // Placeholder
        additionalConcepts: [],
    };

    try {
        const result = await generatePayroll(input);
        if (result.error) {
             toast({ variant: 'destructive', title: 'Error al generar', description: result.error });
        } else {
            setGeneratedPayroll(result.data);
             toast({ title: 'Nómina generada con IA', description: 'Revisa el borrador de la nómina antes de guardarla.' });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo contactar con el servicio de IA.' });
    }
    setIsGenerating(false);
  };
  
  const handleSavePayroll = async () => {
      if (!generatedPayroll) return;

      setIsSaving(true);
      
      const payrollData = {
          ...generatedPayroll,
          employeeId: employee.id, // Link to employee
          ownerId: user?.uid, // Link to business owner
          createdAt: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, "payrolls"), payrollData);
        toast({ title: 'Nómina Guardada', description: `La nómina de ${period} para ${employee.name} ha sido guardada.` });
        onClose();
      } catch (error) {
        console.error("Error al guardar la nómina:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la nómina en la base de datos.' });
      } finally {
        setIsSaving(false);
      }
  }


  return (
    <>
      {payrollToView && <ViewPayrollModal isOpen={!!payrollToView} onClose={() => setPayrollToView(null)} payroll={payrollToView} employee={employee} />}
      {payrollToEdit && <EditPayrollModal isOpen={!!payrollToEdit} onClose={() => setPayrollToEdit(null)} payroll={payrollToEdit} onSave={setGeneratedPayroll} />}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Generar Nómina para {employee.name}</DialogTitle>
            <DialogDescription>
              Selecciona el periodo y deja que la IA genere un borrador de la nómina.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto -mr-6 pr-6 py-4 space-y-4">
            <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="period">Periodo de Liquidación</Label>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger id="period">
                        <SelectValue placeholder="Selecciona un mes" />
                        </SelectTrigger>
                        <SelectContent>
                        {months.map(month => (
                            <SelectItem key={month} value={`${month} ${currentYear}`}>{month} {currentYear}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generar
                </Button>
            </div>

             {generatedPayroll ? (
                <div className="space-y-4 pt-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Borrador Generado</AlertTitle>
                        <AlertDescription>
                            Esto es un borrador. Revisa todos los campos y edita si es necesario. Los cálculos de IRPF y cotizaciones son una estimación.
                        </AlertDescription>
                    </Alert>

                     <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>Nómina de {generatedPayroll.header.period}</span>
                                <div className="flex gap-2">
                                     <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPayrollToEdit(generatedPayroll)}><Pencil className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPayrollToView(generatedPayroll)}><Download className="h-4 w-4" /></Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between"><span className="text-muted-foreground">Total Devengado:</span> <span className="font-medium">{generatedPayroll.accruals.total.toFixed(2)}€</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Total Deducciones:</span> <span className="font-medium">{generatedPayroll.deductions.total.toFixed(2)}€</span></div>
                            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span >Líquido a Percibir:</span> <span>{generatedPayroll.netPay.toFixed(2)}€</span></div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                 <div className="flex items-center justify-center text-center text-muted-foreground h-48 border border-dashed rounded-lg">
                    {isGenerating ? <Loader2 className="h-8 w-8 animate-spin" /> : <p>Aquí aparecerá el borrador de la nómina...</p>}
                 </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
            <Button onClick={handleSavePayroll} disabled={!generatedPayroll || isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Guardar Nómina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
