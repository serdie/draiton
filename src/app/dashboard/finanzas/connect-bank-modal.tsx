
'use client';

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
import { Plus } from 'lucide-react';

interface ConnectBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const availableBanks = [
  {
    name: 'BBVA',
    logo: <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8"><path d="M4.14,11.3,4.14,11.3c2.78-4.88,8.25-6.52,13.13-3.74,4.88,2.78,6.52,8.25,3.74,13.13C16.13,25.57,5.55,25.5,4.14,11.3Z" fill="#004481"></path><path d="M2.9,13.23,2.9,13.23c-2.78,4.88-.14,10.35,4.74,13.13,4.88,2.78,10.35.14,13.13-4.74,4.88-8.62-2.18-18.2-10.8-13.13C.1,13.37-1.54,8.35,2.9,13.23Z" fill="#004481"></path></svg>
  },
  {
    name: 'CaixaBank',
    logo: <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8"><circle cx="12" cy="12" r="10" fill="#000"></circle><path d="M12,12a5.3,5.3,0,0,0-5.3,5.3,1.4,1.4,0,0,0,1.4,1.4H15.9a1.4,1.4,0,0,0,1.4-1.4A5.3,5.3,0,0,0,12,12Z" fill="#fff"></path><path d="M13.4,5.4a2.9,2.9,0,1,0-2.8,0,5.7,5.7,0,0,0-2,4.5H15.3A5.7,5.7,0,0,0,13.4,5.4Z" fill="#ffc107"></path></svg>
  },
  {
    name: 'Santander',
    logo: <div className="h-8 w-8 rounded-full bg-[#EC0000] flex items-center justify-center text-white font-bold text-lg italic">S</div>
  },
  {
    name: 'Revolut',
    logo: <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">R</div>
  },
  {
    name: 'N26',
    logo: <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-lg">N</div>
  }
];

export function ConnectBankModal({ isOpen, onClose }: ConnectBankModalProps) {
  const { toast } = useToast();

  const handleConnect = (bankName: string) => {
    toast({
      title: `Conectando con ${bankName}`,
      description: 'Esta función estará disponible próximamente.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Conectar una nueva cuenta bancaria</DialogTitle>
          <DialogDescription>
            Selecciona tu banco para empezar el proceso de sincronización segura.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {availableBanks.map(bank => (
            <div key={bank.name} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-4">
                {bank.logo}
                <span className="font-semibold">{bank.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleConnect(bank.name)}>
                <Plus className="mr-2 h-4 w-4" />
                Conectar
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
