
'use client';

import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import type { Employee } from './page';
import { AuthContext } from '@/context/auth-context';
import type { GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';
import { Separator } from '@/components/ui/separator';

interface ViewPayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  payroll: GeneratePayrollOutput;
}

export function ViewPayrollModal({ isOpen, onClose, employee, payroll }: ViewPayrollModalProps) {
  const { user } = useContext(AuthContext);
  const company = user?.company;
  const { toast } = useToast();

  const handleDownload = () => {
    toast({ title: 'Función no disponible', description: 'La descarga de nóminas en PDF estará disponible pronto.' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nómina de {employee.name} - {payroll.header.period}</DialogTitle>
          <DialogDescription>
            Detalles de la nómina para el periodo de liquidación seleccionado.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6 space-y-4 text-sm py-4">
            
            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <div>
                    <h3 className="font-semibold">Empresa</h3>
                    <p>{company?.name}</p>
                    <p>CIF: {company?.cif}</p>
                    <p>CCC: {payroll.header.companyName === 'Emprende Total SL' ? '28/123456789' : payroll.header.companyName}</p>
                </div>
                 <div>
                    <h3 className="font-semibold">Empleado</h3>
                    <p>{employee.name}</p>
                    <p>NIF: {employee.nif}</p>
                    <p>Nº S.S.: {employee.socialSecurityNumber}</p>
                </div>
            </div>

            {/* Accruals */}
            <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-base mb-2">I. DEVENGOS</h4>
                <div className="space-y-1">
                    {payroll.accruals.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                            <span>{item.concept}</span>
                            <span>{item.amount.toFixed(2)}€</span>
                        </div>
                    ))}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                    <span>A. TOTAL DEVENGADO</span>
                    <span>{payroll.accruals.total.toFixed(2)}€</span>
                </div>
            </div>

             {/* Deductions */}
            <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-base mb-2">II. DEDUCCIONES</h4>
                <div className="space-y-1">
                    {payroll.deductions.items.map((item, index) => (
                        <div key={index} className="flex justify-between">
                            <span>{item.concept}</span>
                            <span>{item.amount.toFixed(2)}€</span>
                        </div>
                    ))}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                    <span>B. TOTAL A DEDUCIR</span>
                    <span>{payroll.deductions.total.toFixed(2)}€</span>
                </div>
            </div>

            <div className="p-4 bg-primary/10 text-primary rounded-lg flex justify-between items-center font-bold text-lg">
                <span>LÍQUIDO TOTAL A PERCIBIR (A - B)</span>
                <span>{payroll.netPay.toFixed(2)}€</span>
            </div>

            {/* Contribution Bases */}
            <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-base mb-2">BASES DE COTIZACIÓN Y RETENCIÓN IRPF</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                     <div className="flex justify-between"><span className="text-muted-foreground">Contingencias Comunes:</span> <span className="font-mono">{payroll.contributionBases.commonContingencies.toFixed(2)}€</span></div>
                     <div className="flex justify-between"><span className="text-muted-foreground">Contingencias Profesionales:</span> <span className="font-mono">{payroll.contributionBases.professionalContingencies.toFixed(2)}€</span></div>
                     <div className="flex justify-between"><span className="text-muted-foreground">Base IRPF:</span> <span className="font-mono">{payroll.contributionBases.irpfWithholding.toFixed(2)}€</span></div>
                     <div className="flex justify-between"><span className="text-muted-foreground">Porcentaje IRPF:</span> <span className="font-mono">{payroll.contributionBases.irpfPercentage.toFixed(2)}%</span></div>
                </div>
            </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
