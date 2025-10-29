
'use client';

import { useContext, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image as ImageIcon, Loader2, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthContext } from '@/context/auth-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { CompanySettings } from '@/lib/firebase/user-settings-actions';
import Image from 'next/image';
import { uploadCompanyLogo } from '@/lib/firebase/storage-actions';

export function EmpresaSettings() {
    const { user } = useContext(AuthContext);
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState(user?.company?.logoUrl || null);

    const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);

        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Error de autenticación',
                description: 'No se pudo encontrar al usuario. Por favor, inicia sesión de nuevo.',
            });
            setIsSaving(false);
            return;
        }

        const formData = new FormData(event.currentTarget);
        const companyData: CompanySettings = {
            name: formData.get('companyName') as string,
            cif: formData.get('companyCif') as string,
            address: formData.get('companyAddress') as string,
            brandColor: formData.get('brandColor') as string,
            iban: formData.get('companyIban') as string,
            logoUrl: logoPreview || '',
        };

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                company: companyData,
            });

            toast({
                title: 'Configuración guardada',
                description: 'Los detalles de tu empresa han sido actualizados.',
            });
        } catch (error) {
            console.error("Error al actualizar la configuración de la empresa:", error);
            toast({
                variant: 'destructive',
                title: 'Error al guardar',
                description: 'No se pudo guardar la configuración. Revisa los permisos de Firestore.',
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const triggerFileSelect = () => fileInputRef.current?.click();

    const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            const downloadURL = await uploadCompanyLogo(user.uid, file);
            setLogoPreview(downloadURL);
            
            // Immediately update the logo URL in the database
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                'company.logoUrl': downloadURL,
            });

            toast({
                title: 'Logo Subido',
                description: 'El logo de tu empresa ha sido actualizado.',
            });
        } catch (error) {
            console.error('Error al subir el logo:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo subir la imagen. Inténtalo de nuevo.',
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const companyData = user?.company as CompanySettings | undefined;

  return (
    <Card>
      <input type="file" ref={fileInputRef} onChange={handleLogoChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
      <CardHeader>
        <CardTitle>Configuración de la Empresa</CardTitle>
        <CardDescription>Configura los detalles de tu empresa, marca y plantillas de facturas.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-8">
            {/* Company Details Section */}
            <div className="space-y-4">
                <h3 className="font-medium text-lg">Datos Fiscales</h3>
                <p className="text-sm text-muted-foreground">Esta información aparecerá en tus facturas y presupuestos.</p>
                <div className="space-y-2">
                    <Label htmlFor="companyName">Nombre de la Empresa / Autónomo</Label>
                    <Input id="companyName" name="companyName" placeholder="Tu Empresa S.L." defaultValue={companyData?.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="companyCif">CIF / NIF</Label>
                    <Input id="companyCif" name="companyCif" placeholder="B12345678" defaultValue={companyData?.cif} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="companyAddress">Dirección Fiscal</Label>
                    <Textarea id="companyAddress" name="companyAddress" placeholder="Calle Falsa 123, 28080 Madrid, España" defaultValue={companyData?.address}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="companyIban">Número de cuenta (IBAN)</Label>
                    <Input id="companyIban" name="companyIban" placeholder="ES00 0000 0000 0000 0000 0000" defaultValue={companyData?.iban}/>
                </div>
            </div>
            
            <Separator />
            
            {/* Branding Section */}
            <div className="space-y-4">
                <h3 className="font-medium text-lg">Branding para Facturas</h3>
                <p className="text-sm text-muted-foreground">Personaliza el aspecto de tus documentos.</p>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center relative overflow-hidden">
                        {isUploading ? (
                             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : logoPreview ? (
                            <Image src={logoPreview} alt="Logo de la empresa" fill className="object-contain" />
                        ) : (
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        )}
                    </div>
                     <div className="flex flex-col gap-2">
                        <p className="font-medium">Logo de la Empresa</p>
                        <p className="text-xs text-muted-foreground">Sube un archivo PNG, JPG o WEBP (max 2MB).</p>
                         <div className="flex gap-2">
                            <Button size="sm" variant="outline" type="button" onClick={triggerFileSelect} disabled={isUploading}>
                                <Upload className="h-4 w-4 mr-2"/>
                                {logoPreview ? 'Cambiar Logo' : 'Subir Logo'}
                            </Button>
                             {logoPreview && (
                                <Button size="sm" variant="ghost" type="button" className="text-destructive" onClick={() => setLogoPreview(null)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                 <div className="space-y-2 max-w-xs">
                    <Label htmlFor="brandColor">Color de Marca</Label>
                    <div className="flex items-center gap-2">
                         <Input type="color" id="brandColor" name="brandColor" defaultValue={companyData?.brandColor || "#7EC8E3"} className="w-12 h-10 p-1"/>
                         <Input id="brandColorHex" name="brandColorHex" defaultValue={companyData?.brandColor || "#7EC8E3"} />
                    </div>
                     <p className="text-xs text-muted-foreground">Este color se usará en los títulos de tus facturas.</p>
                </div>
            </div>

            <Separator />

            <div className="flex justify-start">
                <Button type="submit" disabled={isSaving || isUploading}>
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                        </>
                    )}
                </Button>
            </div>
        </form>
      </CardContent>
    </Card>
  );
}
