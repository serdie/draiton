
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, MoreHorizontal, Trash2, Pencil, Eye } from 'lucide-react';
import { ConnectBankModal } from './connect-bank-modal';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const BankLogo = ({ bankName }: { bankName: string }) => {
    switch (bankName.toLowerCase()) {
        case 'bbva':
            return <div className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold text-lg">BBVA</div>;
        case 'caixabank':
            return <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-lg"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 100 100" fill="#fecb00"><path d="M50 3C23.9 3 3 23.9 3 50s20.9 47 47 47 47-20.9 47-47S76.1 3 50 3zm0 88.5C27.1 91.5 8.5 72.9 8.5 50S27.1 8.5 50 8.5 91.5 27.1 91.5 50 72.9 91.5 50 91.5z"/><path d="M50 25c-8.3 0-15 6.7-15 15v1.5h30V40c0-8.3-6.7-15-15-15zm-2.5 30h5v15h-5z" fill="#fff"/></svg></div>;
        case 'revolut':
            return <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-xl italic">R</div>;
        default:
            return <div className="h-10 w-10 rounded-full bg-gray-300" />;
    }
};

type ConnectedBank = {
    name: string;
    account: string;
    status: string;
    statusColor: string;
};

const initialBanks: ConnectedBank[] = [
    { name: 'BBVA Cuenta Negocios', account: 'ES...**** 1234', status: 'Sincronizado hace 5m', statusColor: 'text-green-600' },
    { name: 'CaixaBank Cuenta Corriente', account: 'ES...**** 5678', status: 'Sincronizado hace 8m', statusColor: 'text-green-600' },
    { name: 'Revolut Business', account: 'GB...**** 4321', status: 'Requiere atención', statusColor: 'text-yellow-600' },
];

export function BancosTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectedBanks, setConnectedBanks] = useState<ConnectedBank[]>(initialBanks);
  const [bankToDelete, setBankToDelete] = useState<ConnectedBank | null>(null);
  const { toast } = useToast();

  const handleComingSoon = () => {
    toast({
      title: 'Función en desarrollo',
      description: 'Esta acción estará disponible pronto.',
    });
  };

  const handleDeleteBank = () => {
    if (!bankToDelete) return;

    setConnectedBanks(connectedBanks.filter(bank => bank.name !== bankToDelete.name));

    toast({
        title: 'Cuenta Eliminada (Simulación)',
        description: `Se ha eliminado la conexión con ${bankToDelete.name}.`,
    });
    setBankToDelete(null);
  };


  return (
    <>
      <ConnectBankModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
       <AlertDialog open={!!bankToDelete} onOpenChange={(open) => !open && setBankToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción desvinculará la cuenta <strong>{bankToDelete?.name}</strong>. Dejarás de recibir transacciones de este banco. Podrás volver a conectarla más tarde.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setBankToDelete(null)}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteBank} className="bg-destructive hover:bg-destructive/90">
                        Sí, desvincular
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Bancos Sincronizados</CardTitle>
            <CardDescription>
              Gestiona tus cuentas bancarias conectadas.
            </CardDescription>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Conectar Banco
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connectedBanks.map((bank, index) => (
              <div key={index} className="flex items-center p-4 border rounded-lg">
                <div className="flex-shrink-0 mr-4">
                  <BankLogo bankName={bank.name.split(' ')[0]} />
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{bank.name}</p>
                  <p className="text-sm text-muted-foreground">{bank.account}</p>
                </div>
                <div className={cn("text-sm font-medium mr-4", bank.statusColor)}>
                  {bank.status}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleComingSoon}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver cuenta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleComingSoon}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar mi cuenta
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setBankToDelete(bank)} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Borrar la cuenta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
