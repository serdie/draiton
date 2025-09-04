
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, AlertTriangle, Download, PlusCircle, Trash2, HelpCircle, Save } from 'lucide-react';
import type { Employee } from './page';
import { generatePayrollAction, reviewPayrollAction } from './actions';
import { type GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import type { ReviewPayrollOutput } from '@/ai/flows/review-payroll';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AuthContext } from '@/context/auth-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

type AdditionalConcept = {
    id: number;
    concept: string;
    amount: string;
};

export function GeneratePayrollModal({ isOpen, onClose, employee }: GeneratePayrollModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [payrollData, setPayrollData] = useState<GeneratePayrollOutput | null>(null);
  const [reviewData, setReviewData] = useState<ReviewPayrollOutput | null>(null);
  const [period, setPeriod] = useState(`${months[new Date().getMonth()]} ${new Date().getFullYear()}`);
  const [additionalConcepts, setAdditionalConcepts] = useState<AdditionalConcept[]>([]);


  const handleGenerate = async () => {
    if (!user?.company) {
        toast({ variant: 'destructive', title: 'Faltan datos de la empresa', description: 'Por favor, completa los datos de tu empresa en la configuración.' });
        return;
    }
    
    setIsGenerating(true);
    setPayrollData(null);
    setReviewData(null);

    const input = {
        ...employee,
        employeeName: employee.name,
        paymentPeriod: period,
        companyName: user.company.name || 'Empresa Sin Nombre',
        cif: user.company.cif || 'Sin CIF',
        contributionAccountCode: '28/123456789', // Mock data
        professionalGroup: 'Grupo 1', // Mock data
        additionalConcepts: additionalConcepts
            .filter(c => c.concept && c.amount)
            .map(c => ({ concept: c.concept, amount: parseFloat(c.amount) })),
    };

    const result = await generatePayrollAction(input);

    if(result.data) {
        setPayrollData(result.data);
        toast({ title: 'Nómina Generada', description: 'La IA ha calculado la nómina para el periodo seleccionado.' });
    } else {
        toast({ variant: 'destructive', title: 'Error al generar', description: result.error });
    }
    
    setIsGenerating(false);
  };
  
  const handleReview = async () => {
    if (!payrollData) return;
    setIsReviewing(true);

    const result = await reviewPayrollAction({ payrollData });

    if(result.data) {
        setReviewData(result.data);
    } else {
        toast({ variant: 'destructive', title: 'Error en la Revisión', description: result.error });
    }
    
    setIsReviewing(false);
  }
  
  const handleSavePayroll = async () => {
    if (!payrollData || !user) return;
    setIsSaving(true);
    
    const payrollToSave = {
        ...payrollData,
        employeeId: employee.id,
        ownerId: user.uid,
        status: 'Pagado', // Default status on save
        createdAt: serverTimestamp()
    };

    try {
        await addDoc(collection(db, 'payrolls'), payrollToSave);
        toast({ title: 'Nómina Guardada', description: `La nómina de ${period} se ha guardado en el historial de ${employee.name}.` });
        onClose();
    } catch (error) {
        console.error("Error saving payroll:", error);
        toast({ variant: 'destructive', title: 'Error al guardar', description: 'No se pudo guardar la nómina.'})
    } finally {
        setIsSaving(false);
    }
  }

  const handleDownload = () => {
    toast({ title: 'Función no disponible', description: 'La descarga de nóminas en PDF estará disponible pronto.' });
  }

  const addConcept = () => {
    setAdditionalConcepts(prev => [...prev, { id: Date.now(), concept: '', amount: '' }]);
  }

  const removeConcept = (id: number) => {
    setAdditionalConcepts(prev => prev.filter(c => c.id !== id));
  }

  const updateConcept = (id: number, field: 'concept' | 'amount', value: string) => {
    setAdditionalConcepts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generar Nómina para {employee.name}</DialogTitle>
          <DialogDescription>
            Selecciona el periodo, añade conceptos si es necesario, y la IA calculará la nómina.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 flex-1 overflow-y-auto pr-6 -mr-6">
            <div className="space-y-2">
                <Label htmlFor="period">Periodo de Liquidación</Label>
                <Input id="period" value={period} onChange={e => setPeriod(e.target.value)} placeholder="Ej: Julio 2024" />
            </div>

            <div className="space-y-2">
                <Label>Conceptos Adicionales</Label>
                {additionalConcepts.map(c => (
                    <div key={c.id} className="flex items-center gap-2">
                        <Input placeholder="Concepto (ej. Horas Extra)" value={c.concept} onChange={e => updateConcept(c.id, 'concept', e.target.value)} />
                        <Input type="number" placeholder="Importe (€)" value={c.amount} onChange={e => updateConcept(c.id, 'amount', e.target.value)} className="w-32"/>
                        <Button variant="ghost" size="icon" onClick={() => removeConcept(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                ))}
                 <Button variant="outline" size="sm" onClick={addConcept}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Añadir Concepto (Horas Extra, Bonus...)
                </Button>
            </div>
            
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generar Nómina
            </Button>
            
            {payrollData && (
                <div className="p-4 border rounded-lg mt-4 space-y-4">
                    <h3 className="font-semibold text-lg">Nómina para {payrollData.header.period}</h3>
                    
                    {/* Accruals */}
                    <div>
                        <h4 className="font-medium">I. DEVENGOS</h4>
                        <div className="pl-4 mt-2 space-y-1">
                            {payrollData.accruals.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span>{item.concept}</span>
                                    <span>{item.amount.toFixed(2)}€</span>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold text-sm">
                            <span>A. TOTAL DEVENGADO</span>
                            <span>{payrollData.accruals.total.toFixed(2)}€</span>
                        </div>
                    </div>

                     {/* Deductions */}
                    <div>
                        <h4 className="font-medium">II. DEDUCCIONES</h4>
                         <div className="pl-4 mt-2 space-y-1">
                            {payrollData.deductions.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span>{item.concept}</span>
                                    <span>{item.amount.toFixed(2)}€</span>
                                </div>
                            ))}
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold text-sm">
                            <span>B. TOTAL A DEDUCIR</span>
                            <span>{payrollData.deductions.total.toFixed(2)}€</span>
                        </div>
                    </div>

                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg text-primary">
                        <span>LÍQUIDO TOTAL A PERCIBIR (A - B)</span>
                        <span>{payrollData.netPay.toFixed(2)}€</span>
                    </div>

                    <Separator />

                    <Button variant="secondary" className="w-full" onClick={handleReview} disabled={isReviewing}>
                        {isReviewing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}
                        {isReviewing ? 'Analizando...' : 'Revisión con IA'}
                    </Button>

                     {reviewData && (
                        <div className="space-y-2 pt-2">
                           <h4 className="font-semibold">Explicación de la IA:</h4>
                           {reviewData.explanations.map((item, index) => (
                               <div key={index} className="p-2 bg-muted rounded-md text-sm">
                                   <p className="font-medium">{item.concept}</p>
                                   <p className="text-muted-foreground">{item.explanation}</p>
                               </div>
                           ))}
                        </div>
                    )}
                </div>
            )}
             <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Aviso Importante</AlertTitle>
                <AlertDescription>
                    Los cálculos deben ser revisados y validados por un asesor profesional. La nómina podrá ser editada una vez guardada.
                </AlertDescription>
            </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handleSavePayroll} disabled={!payrollData || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
            Guardar Nómina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
