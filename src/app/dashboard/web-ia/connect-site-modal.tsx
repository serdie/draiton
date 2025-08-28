
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Site } from './web-ia-page-content';


interface ConnectSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectSite: (site: Omit<Site, 'id'>) => void;
}

export function ConnectSiteModal({ isOpen, onClose, onConnectSite }: ConnectSiteModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [description, setDescription] = useState('');
  
  const resetForm = () => {
    setSiteName('');
    setSiteUrl('');
    setDescription('');
  }

  const handleConnectSite = () => {
    if (!siteName || !siteUrl) {
      toast({
        variant: 'destructive',
        title: 'Campos Requeridos',
        description: 'El nombre y la URL del sitio son obligatorios.',
      });
      return;
    }
    setIsLoading(true);

    // Pass data to parent component
     onConnectSite({
      name: siteName,
      url: siteUrl,
      description: description,
    });
    
    // Simulate API call to save the external site
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Sitio Conectado',
        description: `El sitio "${siteName}" ha sido añadido a tu lista.`,
      });
      resetForm();
      onClose();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar un Sitio Externo</DialogTitle>
          <DialogDescription>
            Añade tu web o tienda online existente para gestionarla desde aquí.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Nombre del Sitio</Label>
            <Input id="site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Ej: Mi Tienda de Camisetas" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-url">URL del Sitio Web</Label>
            <Input id="site-url" type="url" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://www.ejemplo.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">Descripción (Opcional)</Label>
            <Textarea id="site-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descripción de tu sitio." rows={3}/>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleConnectSite} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Conectar Sitio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
