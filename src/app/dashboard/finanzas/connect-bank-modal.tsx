
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

const BankLogo = ({ bankName }: { bankName: string }) => {
    switch (bankName.toLowerCase()) {
        case 'bbva':
            return <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold text-lg">BBVA</div>;
        case 'caixabank':
            return <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 100 100" fill="#fecb00"><path d="M50 3C23.9 3 3 23.9 3 50s20.9 47 47 47 47-20.9 47-47S76.1 3 50 3zm0 88.5C27.1 91.5 8.5 72.9 8.5 50S27.1 8.5 50 8.5 91.5 27.1 91.5 50 72.9 91.5 50 91.5z"/><path d="M50 25c-8.3 0-15 6.7-15 15v1.5h30V40c0-8.3-6.7-15-15-15zm-2.5 30h5v15h-5z" fill="#fff"/></svg></div>;
        case 'santander':
             return <div className="h-8 w-8 rounded-full bg-[#EC0000] flex items-center justify-center text-white font-bold text-lg italic">S</div>
        case 'revolut':
            return <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">R</div>;
        case 'n26':
            return <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-lg">N</div>;
        default:
            return <div className="h-8 w-8 rounded-full bg-gray-300" />;
    }
};

const availableBanks = [
  { name: 'BBVA' },
  { name: 'CaixaBank' },
  { name: 'Santander' },
  { name: 'Revolut' },
  { name: 'N26' }
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
                <BankLogo bankName={bank.name} />
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
