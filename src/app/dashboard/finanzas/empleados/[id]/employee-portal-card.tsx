
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Employee } from '../types';
import { nanoid } from 'nanoid';
import { Copy, Check, ExternalLink, KeyRound, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { updateEmployeePasswordAction } from '@/lib/firebase/admin-actions';
import { Separator } from '@/components/ui/separator';

interface EmployeePortalCardProps {
  employee: Employee;
}

export function EmployeePortalCard({ employee }: EmployeePortalCardProps) {
  const [isActive, setIsActive] = useState(employee.employeePortalActive || false);
  const [portalId, setPortalId] = useState(employee.employeePortalId || '');
  const [isCopied, setIsCopied] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, startPasswordTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setIsActive(employee.employeePortalActive || false);
    setPortalId(employee.employeePortalId || '');
  }, [employee]);

  const handleTogglePortal = async (checked: boolean) => {
    let newPortalId = portalId;
    if (checked && !portalId) {
        newPortalId = nanoid(12);
        setPortalId(newPortalId);
    }
    
    setIsActive(checked);

    const employeeRef = doc(db, 'employees', employee.id);
    try {
      await updateDoc(employeeRef, {
        employeePortalActive: checked,
        clientPortalId: newPortalId, // Ensure this fieldname is correct in Firestore
      });
      toast({
        title: 'Portal de Empleado Actualizado',
        description: `El portal ha sido ${checked ? 'activado' : 'desactivado'}.`,
      });
    } catch (error) {
      console.error('Error al actualizar el portal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo actualizar el estado del portal.',
      });
      // Revert UI state on error
      setIsActive(!checked);
    }
  };

  const handleChangePassword = () => {
    if (newPassword.length < 6) {
        toast({ variant: 'destructive', title: 'Contraseña no válida', description: 'La contraseña debe tener al menos 6 caracteres.' });
        return;
    }
    startPasswordTransition(async () => {
        const result = await updateEmployeePasswordAction(employee.id, newPassword);
        if (result.success) {
            toast({ title: 'Contraseña actualizada', description: 'Se ha cambiado la contraseña del empleado.' });
            setNewPassword('');
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    });
  }

  const portalUrl = `${window.location.origin}/portal-empleado/${portalId}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(portalUrl).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portal y Credenciales del Empleado</CardTitle>
        <CardDescription>Gestiona el acceso del empleado a su portal personal y sus credenciales.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="portal-status" className="text-base">
              Activar Portal
            </Label>
            <p className="text-sm text-muted-foreground">
              Permite al empleado ver sus datos, nóminas y fichajes.
            </p>
          </div>
          <Switch
            id="portal-status"
            checked={isActive}
            onCheckedChange={handleTogglePortal}
          />
        </div>

        {isActive && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/40">
             <h3 className="font-medium">Enlace y Credenciales de Acceso</h3>
             <div className="space-y-1">
                <Label>Email (Usuario)</Label>
                 <Input readOnly value={employee.email} />
             </div>
             <div className="space-y-1">
                <Label>Enlace del Portal</Label>
                <div className="flex items-center gap-2">
                    <Input readOnly value={portalUrl} />
                    <Button variant="outline" size="icon" onClick={copyToClipboard}>
                        {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                     <Button asChild variant="outline" size="icon">
                        <Link href={portalUrl} target="_blank"><ExternalLink className="h-4 w-4" /></Link>
                    </Button>
                </div>
             </div>
          </div>
        )}

        <Separator />

        <div className="space-y-4">
            <h3 className="font-medium text-base flex items-center gap-2"><KeyRound className="h-4 w-4" />Gestionar Contraseña</h3>
            <p className="text-sm text-muted-foreground">
                Establece una nueva contraseña para el empleado. El empleado deberá usarla para iniciar sesión en su portal.
            </p>
             <div className="flex items-center gap-2">
                <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                />
                 <Button onClick={handleChangePassword} disabled={isUpdatingPassword || newPassword.length < 6}>
                    {isUpdatingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                    Cambiar
                 </Button>
             </div>
        </div>

      </CardContent>
    </Card>
  );
}
