
'use client';

import { useState, useContext, useEffect } from 'react';
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
import { Loader2, Sparkles, Save } from 'lucide-react';
import type { Employee } from './page';
import { AuthContext } from '@/context/auth-context';
import { type GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import { Separator } from '@/components/ui/separator';

interface EditPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  payroll: GeneratePayrollOutput;
}

export function EditPayrollModal({ isOpen, onClose, employee, payroll }: EditPayrollModalProps) {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [payrollData, setPayrollData] = useState<GeneratePayrollOutput>(payroll);

  useEffect(() => {
    setPayrollData(payroll);
  }, [payroll]);

  const handleFieldChange = (section: 'accruals' | 'deductions', index: number, field: 'concept' | 'amount', value: string) => {
    setPayrollData(prev => {
        if (!prev) return null;
        const newPayroll = JSON.parse(JSON.stringify(prev)); // Deep copy
        const items = newPayroll[section].items;
        if (field === 'amount') {
            items[index][field] = parseFloat(value) || 0;
        } else {
            items[index][field] = value;
        }
        
        // Recalculate totals
        newPayroll.accruals.total = newPayroll.accruals.items.reduce((sum: number, item: { amount: number; }) => sum + item.amount, 0);
        newPayroll.deductions.total = newPayroll.deductions.items.reduce((sum: number, item: { amount: number; }) => sum + item.amount, 0);
        newPayroll.netPay = newPayroll.accruals.total - newPayroll.deductions.total;

        return newPayroll;
    });
  }

  const handleSave = () => {
    setIsSaving(true);
    // Here you would typically call a server action to save the updated payroll data
    setTimeout(() => {
        toast({ title: "Nómina Actualizada", description: "Los cambios en la nómina han sido guardados."});
        setIsSaving(false);
        onClose();
    }, 1000);
  };

  if (!payrollData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Nómina de {employee.name}</DialogTitle>
          <DialogDescription>
            Ajusta los valores de la nómina para el periodo {payrollData.header.period}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">Nómina para {payrollData.header.period}</h3>
            
            {/* Accruals */}
            <div>
              <h4 className="font-medium">I. DEVENGOS</h4>
              <div className="pl-4 mt-2 space-y-2">
                {payrollData.accruals.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Input value={item.concept} onChange={e => handleFieldChange('accruals', index, 'concept', e.target.value)} className="flex-1"/>
                    <Input type="number" value={item.amount} onChange={e => handleFieldChange('accruals', index, 'amount', e.target.value)} className="w-28 text-right" />
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
              <div className="pl-4 mt-2 space-y-2">
                {payrollData.deductions.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Input value={item.concept} onChange={e => handleFieldChange('deductions', index, 'concept', e.target.value)} className="flex-1"/>
                    <Input type="number" value={item.amount} onChange={e => handleFieldChange('deductions', index, 'amount', e.target.value)} className="w-28 text-right" />
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4"/>
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
