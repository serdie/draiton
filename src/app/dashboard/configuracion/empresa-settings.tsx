
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EmpresaSettings() {
    const { toast } = useToast();

    const handleSaveChanges = () => {
        toast({ title: "Configuración guardada", description: "Los detalles de tu empresa y marca han sido actualizados." });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de la Empresa</CardTitle>
        <CardDescription>Configura los detalles de tu empresa, marca y plantillas de facturas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">

        {/* Company Details Section */}
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Datos Fiscales</h3>
            <p className="text-sm text-muted-foreground">Esta información aparecerá en tus facturas y presupuestos.</p>
            <div className="space-y-2">
                <Label htmlFor="company-name">Nombre de la Empresa / Autónomo</Label>
                <Input id="company-name" placeholder="Tu Empresa S.L." />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-cif">CIF / NIF</Label>
                <Input id="company-cif" placeholder="B12345678" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="company-address">Dirección Fiscal</Label>
                <Textarea id="company-address" placeholder="Calle Falsa 123, 28080 Madrid, España" />
            </div>
        </div>
        
        <Separator />
        
        {/* Branding Section */}
        <div className="space-y-4">
            <h3 className="font-medium text-lg">Branding para Facturas</h3>
            <p className="text-sm text-muted-foreground">Personaliza el aspecto de tus documentos.</p>
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                 <div className="flex flex-col gap-2">
                    <p className="font-medium">Logo de la Empresa</p>
                    <p className="text-xs text-muted-foreground">Sube un archivo PNG o JPG (max 2MB).</p>
                    <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4 mr-2"/>
                        Subir Logo
                    </Button>
                </div>
            </div>
             <div className="space-y-2 max-w-xs">
                <Label htmlFor="brand-color">Color de Marca</Label>
                <div className="flex items-center gap-2">
                     <Input type="color" id="brand-color" defaultValue="#7EC8E3" className="w-12 h-10 p-1"/>
                     <Input id="brand-color-hex" defaultValue="#7EC8E3" />
                </div>
                 <p className="text-xs text-muted-foreground">Este color se usará en los títulos de tus facturas.</p>
            </div>
        </div>

        <Separator />

        <div className="flex justify-start">
            <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
        </div>

      </CardContent>
    </Card>
  );
}
