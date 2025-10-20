
'use client';

import { useState } from 'react';
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
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { type GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: GeneratePayrollOutput;
  onSave: (updatedPayroll: GeneratePayrollOutput) => void;
}

export function EditPayrollModal({ isOpen, onClose, payroll, onSave }: EditPayrollModalProps) {
  const [editedPayroll, setEditedPayroll] = useState(payroll);
  const [isLoading, setIsLoading] = useState(false);

  const handleNumericChange = (section: 'accruals' | 'deductions', index: number, field: 'amount', value: string) => {
    const numericValue = parseFloat(value) || 0;
    const newPayroll = { ...editedPayroll };
    (newPayroll[section].items[index] as any)[field] = numericValue;
    recalculateTotals(newPayroll);
  };
  
  const handleConceptChange = (section: 'accruals' | 'deductions', index: number, field: 'concept', value: string) => {
    const newPayroll = { ...editedPayroll };
    newPayroll[section].items[index][field] = value;
    setEditedPayroll(newPayroll);
  };

  const addItem = (section: 'accruals' | 'deductions') => {
    const newPayroll = { ...editedPayroll };
    newPayroll[section].items.push({ concept: 'Nuevo Concepto', amount: 0 });
    recalculateTotals(newPayroll);
  }
  
  const removeItem = (section: 'accruals' | 'deductions', index: number) => {
     const newPayroll = { ...editedPayroll };
     newPayroll[section].items.splice(index, 1);
     recalculateTotals(newPayroll);
  }

  const recalculateTotals = (payrollToUpdate: GeneratePayrollOutput) => {
    const totalAccruals = payrollToUpdate.accruals.items.reduce((sum, item) => sum + item.amount, 0);
    const totalDeductions = payrollToUpdate.deductions.items.reduce((sum, item) => sum + item.amount, 0);
    const netPay = totalAccruals - totalDeductions;
    
    setEditedPayroll({
        ...payrollToUpdate,
        accruals: { ...payrollToUpdate.accruals, total: totalAccruals },
        deductions: { ...payrollToUpdate.deductions, total: totalDeductions },
        netPay: netPay,
    });
  }

  const handleSave = () => {
    onSave(editedPayroll);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editar Borrador de Nómina</DialogTitle>
          <DialogDescription>Ajusta los conceptos y valores de la nómina antes de guardarla.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 -mr-6 pr-6">
            <div className="grid grid-cols-2 gap-6 py-4">
            {/* DEVENGOS */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Devengos</h3>
                {editedPayroll.accruals.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input value={item.concept} onChange={e => handleConceptChange('accruals', index, 'concept', e.target.value)} className="flex-1"/>
                        <Input type="number" value={item.amount} onChange={e => handleNumericChange('accruals', index, 'amount', e.target.value)} className="w-28 text-right" />
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem('accruals', index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addItem('accruals')}><PlusCircle className="mr-2 h-4 w-4"/>Añadir Devengo</Button>
                <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total Devengado:</span>
                    <span>{editedPayroll.accruals.total.toFixed(2)}€</span>
                </div>
            </div>

            {/* DEDUCCIONES */}
            <div className="space-y-4">
                 <h3 className="font-semibold text-lg">Deducciones</h3>
                {editedPayroll.deductions.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input value={item.concept} onChange={e => handleConceptChange('deductions', index, 'concept', e.target.value)} className="flex-1"/>
                        <Input type="number" value={item.amount} onChange={e => handleNumericChange('deductions', index, 'amount', e.target.value)} className="w-28 text-right" />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem('deductions', index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addItem('deductions')}><PlusCircle className="mr-2 h-4 w-4"/>Añadir Deducción</Button>
                 <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total a Deducir:</span>
                    <span>{editedPayroll.deductions.total.toFixed(2)}€</span>
                </div>
            </div>
            </div>
            <div className="mt-4 p-4 bg-muted rounded-md text-right">
                <span className="text-lg font-bold">LÍQUIDO A PERCIBIR: {editedPayroll.netPay.toFixed(2)}€</span>
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
