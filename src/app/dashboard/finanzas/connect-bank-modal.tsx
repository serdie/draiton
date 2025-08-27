
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
import { Plus, CreditCard } from 'lucide-react';

interface ConnectBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaypalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.444 6.417c.307-1.129.97-2.18 2.18-2.18h5.903c4.16 0 5.834 2.14 5.207 6.182-.482 3.076-2.583 4.88-5.11 4.88h-1.686c-.53 0-.96.42-1.03.95l-.564 3.722c-.04.26-.25.45-.51.45h-1.92c-.22 0-.41-.15-.47-.36-.85-3.076.28-4.52 1.83-4.52h.42c.47 0 .86-.34.93-.8l.56-3.73c.04-.26.25-.45.51-.45h.35c.87 0 1.63-.82 1.74-1.8.13-1.14-.6-1.92-1.46-1.92h-2.92c-.95 0-1.74.83-1.63 1.92.11.98.87 1.8 1.81 1.8h.68c.48 0 .87.35.94.82l.56 3.73c.04.26.25.45.51.45h.39c.87 0 1.63-.82 1.74-1.8.13-1.14-.6-1.92-1.46-1.92h-2.92c-2.31 0-3.88-2.03-3.13-5.07zM11.9 15.198c-.2 0-.37-.13-.43-.32l-1.3-4.22c-.04-.13-.02-.27.05-.39.07-.12.2-.19.34-.19h2.33c2.2 0 3.2 1.3 3.5 3.3.2 1.25-.3 2.1-1.1 2.1h-3.4z" />
    </svg>
);

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
        case 'paypal':
            return <div className="h-8 w-8 flex items-center justify-center text-blue-600"><PaypalIcon /></div>
        case 'stripe':
            return <div className="h-8 w-8 flex items-center justify-center text-purple-600"><CreditCard /></div>
        default:
            return <div className="h-8 w-8 rounded-full bg-gray-300" />;
    }
};

const availableBanks = [
  { name: 'BBVA' },
  { name: 'CaixaBank' },
  { name: 'Santander' },
  { name: 'Revolut' },
  { name: 'N26' },
  { name: 'PayPal' },
  { name: 'Stripe' }
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
