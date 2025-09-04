
'use client';

import { useState, useContext, useRef } from 'react';
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
import { Loader2, Sparkles, AlertTriangle, Download } from 'lucide-react';
import type { Employee } from './page';
import { AuthContext } from '@/context/auth-context';
import { generatePayrollAction } from './actions';
import { type GeneratePayrollOutput } from '@/ai/flows/generate-payroll';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface GeneratePayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function GeneratePayrollModal({ isOpen, onClose, employee }: GeneratePayrollModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [payrollData, setPayrollData] = useState<GeneratePayrollOutput | null>(null);
  const [period, setPeriod] = useState(`${months[new Date().getMonth()]} ${new Date().getFullYear()}`);

  const handleGenerate = async () => {
    if (!user?.company) {
        toast({ variant: 'destructive', title: 'Faltan datos de la empresa', description: 'Por favor, completa los datos de tu empresa en la configuración.' });
        return;
    }
    
    setIsGenerating(true);
    setPayrollData(null);

    const input = {
        ...employee,
        employeeName: employee.name,
        paymentPeriod: period,
        companyName: user.company.name || 'Empresa Sin Nombre',
        cif: user.company.cif || 'Sin CIF',
        contributionAccountCode: '28/123456789', // Mock data
        professionalGroup: 'Grupo 1', // Mock data
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
  
  const handleDownload = () => {
    toast({ title: 'Función no disponible', description: 'La descarga de nóminas en PDF estará disponible pronto.' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generar Nómina para {employee.name}</DialogTitle>
          <DialogDescription>
            Selecciona el periodo y la IA calculará la nómina.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            <div className="flex items-end gap-4">
                 <div className="space-y-2 flex-grow">
                    <Label htmlFor="period">Periodo de Liquidación</Label>
                    <Input id="period" value={period} onChange={e => setPeriod(e.target.value)} placeholder="Ej: Julio 2024" />
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Generar Nómina
                </Button>
            </div>
            
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
                </div>
            )}
             <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Aviso Importante</AlertTitle>
                <AlertDescription>
                    Esta es una simulación generada por IA con fines orientativos. Los cálculos deben ser revisados y validados por un asesor profesional.
                </AlertDescription>
            </Alert>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handleDownload} disabled={!payrollData}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

