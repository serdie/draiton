
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Employee } from '../types';
import { Copy, Check, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface EmployeePortalCardProps {
  employee: Employee;
}

export function EmployeePortalCard({ employee }: EmployeePortalCardProps) {
  const [isActive, setIsActive] = useState(employee.employeePortalActive || false);
  const [portalId, setPortalId] = useState(employee.employeePortalId || '');
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsActive(employee.employeePortalActive || false);
    setPortalId(employee.employeePortalId || '');
  }, [employee]);

  const handleTogglePortal = async (checked: boolean) => {
    setIsActive(checked);

    const employeeRef = doc(db, 'employees', employee.id);
    try {
      await updateDoc(employeeRef, {
        employeePortalActive: checked,
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
        <CardTitle>Portal del Empleado</CardTitle>
        <CardDescription>Gestiona el acceso del empleado a su portal personal.</CardDescription>
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
             <h3 className="font-medium">Enlace del Portal</h3>
             <div className="flex items-center gap-2">
                <input
                    readOnly
                    value={portalUrl}
                    className="w-full h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                />
                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button size="sm" asChild>
                    <Link href={portalUrl} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver Portal de Empleado
                    </Link>
                </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
