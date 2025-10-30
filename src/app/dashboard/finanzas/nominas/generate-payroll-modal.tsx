
'use client';

import { useState, useContext } from 'react';
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
import { Loader2, Sparkles, FileSignature, AlertCircle, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/context/auth-context';
import { generatePayrollAction } from './actions';
import { type Employee } from '../empleados/types';
import type { GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ViewPayrollModal } from './view-payroll-modal';
import { EditPayrollModal } from './edit-payroll-modal';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Separator } from '@/components/ui/separator';

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

type AdditionalConcept = {
  id: number;
  concept: string;
  amount: string;
};

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const currentYear = new Date().getFullYear();

export function GeneratePayrollModal({ isOpen, onClose, employee }: GeneratePayrollModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [period, setPeriod] = useState(`${months[new Date().getMonth()]} ${currentYear}`);
  const [additionalConcepts, setAdditionalConcepts] = useState<AdditionalConcept[]>([]);
  const [generatedPayroll, setGeneratedPayroll] = useState<GeneratePayrollOutput | null>(null);

  const resetState = () => {
    setIsGenerating(false);
    setIsSaving(false);
    setGeneratedPayroll(null);
    setAdditionalConcepts([]);
    setPeriod(`${months[new Date().getMonth()]} ${currentYear}`);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const addConcept = () => {
    setAdditionalConcepts([...additionalConcepts, { id: Date.now(), concept: '', amount: '' }]);
  };

  const removeConcept = (id: number) => {
    setAdditionalConcepts(additionalConcepts.filter(c => c.id !== id));
  };

  const handleConceptChange = (id: number, field: 'concept' | 'amount', value: string) => {
    setAdditionalConcepts(
      additionalConcepts.map(c => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleGenerate = async () => {
    if (!user || !user.company) {
      toast({ variant: 'destructive', title: 'Error', description: 'Faltan datos de la empresa en tu configuración.' });
      return;
    }
    setIsGenerating(true);
    setGeneratedPayroll(null);

    const conceptsForAI = additionalConcepts
      .filter(c => c.concept && c.amount)
      .map(c => ({
        concept: c.concept,
        amount: parseFloat(c.amount) || 0
      }));

    const input = {
        employeeName: employee.name,
        nif: employee.nif,
        socialSecurityNumber: employee.socialSecurityNumber,
        contractType: employee.contractType,
        professionalGroup: 'Grupo 1 - Ingenieros y Licenciados', // Esto podría ser un campo del empleado
        grossAnnualSalary: employee.grossAnnualSalary,
        paymentPeriod: period,
        companyName: user.company.name || 'Nombre Empresa no configurado',
        cif: user.company.cif || 'CIF no configurado',
        contributionAccountCode: '28/1234567/89', // Ejemplo
        additionalConcepts: conceptsForAI,
    };

    try {
        const result = await generatePayrollAction(input);
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
          employeeId: employee.id,
          ownerId: user?.uid,
          createdAt: serverTimestamp(),
      };

      try {
        await addDoc(collection(db, "payrolls"), payrollData);
        toast({ title: 'Nómina Guardada', description: `La nómina de ${period} para ${employee.name} ha sido guardada.` });
        handleClose();
      } catch (error) {
        console.error("Error al guardar la nómina:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo guardar la nómina en la base de datos.' });
      } finally {
        setIsSaving(false);
      }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Generar Nómina para {employee.name}</DialogTitle>
          <DialogDescription>
            Selecciona el periodo, añade conceptos si es necesario, y la IA calculará la nómina.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="space-y-2">
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
          
          <div className="space-y-2">
            <Label>Conceptos Adicionales (Opcional)</Label>
            <div className="space-y-2">
              {additionalConcepts.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input 
                    placeholder="Concepto (ej. Horas Extra)" 
                    value={item.concept}
                    onChange={(e) => handleConceptChange(item.id, 'concept', e.target.value)}
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    placeholder="Importe" 
                    value={item.amount}
                    onChange={(e) => handleConceptChange(item.id, 'amount', e.target.value)}
                    className="w-28 text-right" 
                  />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeConcept(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addConcept}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Concepto
            </Button>
          </div>

          <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Aviso Importante</AlertTitle>
              <AlertDescription>
                Los cálculos deben ser revisados y validados por un asesor profesional. La nómina podrá ser editada una vez guardada.
              </AlertDescription>
          </Alert>
          
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
              Generar Nómina
          </Button>

          {generatedPayroll && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-center">Borrador de Nómina Generado</h3>
              <div className="p-4 rounded-lg bg-muted space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Devengado:</span>
                    <span className="font-semibold">{generatedPayroll.accruals.total.toFixed(2)}€</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Deducciones:</span>
                    <span className="font-semibold">{generatedPayroll.deductions.total.toFixed(2)}€</span>
                </div>
                 <Separator className="my-2"/>
                 <div className="flex justify-between font-bold text-base">
                    <span>Líquido a Percibir:</span>
                    <span>{generatedPayroll.netPay.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>Cerrar</Button>
          <Button onClick={handleSavePayroll} disabled={!generatedPayroll || isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Guardar Nómina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
