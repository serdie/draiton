
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
import { Loader2, Sparkles, FileSignature, AlertCircle, Trash2, PlusCircle, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/context/auth-context';
import { generatePayrollAction, reviewPayrollAction } from './actions';
import { type Employee } from '../empleados/types';
import type { GeneratePayrollOutput, ReviewPayrollOutput } from '@/ai/schemas/payroll-schemas';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ViewPayrollModal } from './view-payroll-modal';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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
  
  const [period, setPeriod] = useState(`${months[new Date().getMonth()]} ${currentYear}`);
  const [additionalConcepts, setAdditionalConcepts] = useState<AdditionalConcept[]>([]);
  const [generatedPayroll, setGeneratedPayroll] = useState<GeneratePayrollOutput | null>(null);

  const resetState = () => {
    setIsGenerating(false);
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

    // Handle hireDate format, which might be a Date or a Firestore Timestamp
    let hireDateString = '';
    if (employee.hireDate) {
        // Check if it's a Firestore Timestamp object
        if (employee.hireDate instanceof Timestamp) {
            hireDateString = employee.hireDate.toDate().toISOString();
        } 
        // If it's already a Date object (or a string that can be parsed)
        else if (employee.hireDate instanceof Date) {
            hireDateString = employee.hireDate.toISOString();
        }
        else {
             hireDateString = new Date(employee.hireDate).toISOString();
        }
    }


    const input = {
        employeeName: employee.name,
        nif: employee.nif,
        socialSecurityNumber: employee.socialSecurityNumber,
        contractType: employee.contractType,
        professionalGroup: 'Grupo 1 - Ingenieros y Licenciados', // Placeholder
        position: employee.position,
        hireDate: hireDateString,
        grossAnnualSalary: employee.grossAnnualSalary,
        paymentPeriod: period,
        paymentFrequency: employee.paymentFrequency || 'Mensual',
        proratedExtraPays: employee.proratedExtraPays ?? true,
        companyName: user.company.name || 'Nombre Empresa no configurado',
        cif: user.company.cif || 'CIF no configurado',
        companyAddress: user.company.address ? `${user.company.address.addressLine1}, ${user.company.address.city}, ${user.company.address.postalCode}` : 'Dirección no configurada',
        contributionAccountCode: '28/1234567/89', // Placeholder
        additionalConcepts: conceptsForAI,
    };

    try {
        const result = await generatePayrollAction(input);
        if (result.error) {
             toast({ variant: 'destructive', title: 'Error al generar', description: result.error });
        } else if (result.data) {
            setGeneratedPayroll({ ...result.data, header: { ...result.data.header, paymentPeriod: period } });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo contactar con el servicio de IA.' });
    }
    setIsGenerating(false);
  };
  
  return (
    <>
    {generatedPayroll && (
        <ViewPayrollModal 
            isOpen={!!generatedPayroll}
            onClose={() => setGeneratedPayroll(null)}
            payroll={generatedPayroll}
            employee={employee}
            onSaveSuccess={handleClose}
        />
    )}
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
          
          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
              Generar Nómina
          </Button>

          <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Aviso Importante</AlertTitle>
              <AlertDescription>
                Los cálculos deben ser revisados y validados por un asesor profesional. La nómina podrá ser editada una vez guardada.
              </AlertDescription>
          </Alert>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
