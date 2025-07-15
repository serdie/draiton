
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Landmark, Plus, Trash2, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const BankIcon = ({ name }: { name: string }) => {
    // In a real app, you would have specific icons for each bank
    return <Landmark className="h-6 w-6 text-muted-foreground" />;
}

const connectedAccounts = [
    { id: '1', bank: 'BBVA', name: 'Cuenta de Negocios', lastSync: 'Hace 2 horas', status: 'Sincronizado' },
    { id: '2', bank: 'CaixaBank', name: 'Ahorros Empresa', lastSync: 'Ayer', status: 'Sincronizado' },
    { id: '3', bank: 'Santander', name: 'Tarjeta de Crédito', lastSync: 'Hace 3 días', status: 'Error de Sincronización' },
];

export default function BancosPage() {
    const { toast } = useToast();

    const handleConnect = () => {
        toast({
            title: "Función en desarrollo",
            description: "La conexión con entidades bancarias estará disponible pronto."
        })
    }

    const handleSync = () => {
        toast({
            title: "Sincronizando...",
            description: "Actualizando transacciones con el banco (simulación)."
        })
    }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Conexión Bancaria</h1>
            <p className="text-muted-foreground">
              Conecta tus cuentas bancarias para automatizar el registro de gastos y transacciones.
            </p>
          </div>
          <Button onClick={handleConnect}>
            <Plus className="mr-2 h-4 w-4" />
            Conectar Nueva Cuenta
          </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Cuentas Conectadas</CardTitle>
                <CardDescription>
                    Gestiona tus cuentas bancarias conectadas. Los gastos se registrarán automáticamente.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Banco</TableHead>
                            <TableHead>Nombre de la Cuenta</TableHead>
                            <TableHead>Última Sincronización</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {connectedAccounts.map((account) => (
                        <TableRow key={account.id}>
                            <TableCell className="flex items-center gap-3">
                                <BankIcon name={account.bank} />
                                <span className="font-medium">{account.bank}</span>
                            </TableCell>
                            <TableCell>{account.name}</TableCell>
                            <TableCell>{account.lastSync}</TableCell>
                            <TableCell>
                                <Badge variant={account.status === 'Sincronizado' ? 'default' : 'destructive'}>
                                    {account.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button variant="ghost" size="icon" onClick={handleSync}>
                                    <RefreshCcw className="h-4 w-4" />
                                </Button>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>¿Desconectar cuenta?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción desconectará la cuenta de {account.bank}. Dejarás de recibir transacciones automáticamente. Podrás volver a conectarla cuando quieras.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90">Sí, desconectar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
