
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
import { Separator } from '@/components/ui/separator';

interface EditPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: GeneratePayrollOutput;
  onSave: (updatedPayroll: GeneratePayrollOutput) => void;
}

export function EditPayrollModal({ isOpen, onClose, payroll, onSave }: EditPayrollModalProps) {
  const [editedPayroll, setEditedPayroll] = useState(payroll);
  const [isLoading, setIsLoading] = useState(false);

  const handleItemChange = (
    section: 'accruals' | 'deductions',
    index: number,
    field: 'concept' | 'accrual' | 'deduction',
    value: string
  ) => {
    const newPayroll = { ...editedPayroll };
    const items = newPayroll[section].items;

    if (field === 'concept') {
      items[index].concept = value;
    } else {
      (items[index] as any)[field] = parseFloat(value) || 0;
    }
    
    setEditedPayroll(newPayroll);
    recalculateTotals();
  };
  
  const addItem = (section: 'accruals' | 'deductions') => {
    const newPayroll = { ...editedPayroll };
    const newItem = {
      code: '999',
      concept: 'Nuevo Concepto',
      quantity: 0,
      price: 0,
      accrual: section === 'accruals' ? 0 : undefined,
      deduction: section === 'deductions' ? 0 : undefined,
    };
    newPayroll[section].items.push(newItem);
    setEditedPayroll(newPayroll);
    recalculateTotals();
  }
  
  const removeItem = (section: 'accruals' | 'deductions', index: number) => {
     const newPayroll = { ...editedPayroll };
     newPayroll[section].items.splice(index, 1);
     setEditedPayroll(newPayroll);
     recalculateTotals();
  }

  const recalculateTotals = () => {
    setEditedPayroll(prev => {
        const totalAccruals = prev.accruals.items.reduce((sum, item) => sum + (item.accrual || 0), 0);
        const totalDeductions = prev.deductions.items.reduce((sum, item) => sum + (item.deduction || 0), 0);
        const netPay = totalAccruals - totalDeductions;
        
        return {
            ...prev,
            accruals: { ...prev.accruals, total: totalAccruals },
            deductions: { ...prev.deductions, total: totalDeductions },
            summary: { totalAccruals, totalDeductions },
            netPay,
        };
    });
  }

  const handleSave = () => {
    recalculateTotals(); // Final recalculation before saving
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
                <div className="space-y-2">
                    <h3 className="font-semibold text-center mb-2">DEVENGOS</h3>
                    {editedPayroll.accruals.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input value={item.concept} onChange={e => handleItemChange('accruals', index, 'concept', e.target.value)} className="flex-1"/>
                            <Input type="number" value={item.accrual} onChange={e => handleItemChange('accruals', index, 'accrual', e.target.value)} className="w-28 text-right" />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem('accruals', index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                     <Button variant="outline" size="sm" onClick={() => addItem('accruals')}><PlusCircle className="mr-2 h-4 w-4"/>Añadir Devengo</Button>
                </div>
                {/* DEDUCCIONES */}
                 <div className="space-y-2">
                    <h3 className="font-semibold text-center mb-2">DEDUCCIONES</h3>
                    {editedPayroll.deductions.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input value={item.concept} onChange={e => handleItemChange('deductions', index, 'concept', e.target.value)} className="flex-1"/>
                            <Input type="number" value={item.deduction} onChange={e => handleItemChange('deductions', index, 'deduction', e.target.value)} className="w-28 text-right" />
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem('deductions', index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addItem('deductions')}><PlusCircle className="mr-2 h-4 w-4"/>Añadir Deducción</Button>
                </div>
            </div>
            <Separator className="my-4" />
             <div className="grid grid-cols-2 gap-x-8 text-sm">
                <div className="flex justify-between font-bold">
                    <span>TOTAL DEVENGADO</span>
                    <span>{editedPayroll.accruals.total.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>TOTAL A DEDUCIR</span>
                    <span>{editedPayroll.deductions.total.toFixed(2)}€</span>
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
