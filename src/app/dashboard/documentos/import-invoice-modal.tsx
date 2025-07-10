'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, UploadCloud, Camera, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ImportInvoiceModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState('upload');
  const [fileName, setFileName] = useState('');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file ? file.name : '');
  };

  const handleImport = () => {
    toast({
      title: 'Importación Simulada',
      description: 'La funcionalidad de importación real se implementará pronto.',
    });
    onClose();
  };
  
  const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Cámara no soportada',
          description: 'Tu navegador no soporta el acceso a la cámara.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acceso a la cámara denegado',
          description: 'Por favor, activa los permisos de la cámara en tu navegador.',
        });
      }
    };

    useEffect(() => {
        if (isOpen && activeTab === 'camera') {
            getCameraPermission();
        } else {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        }
    }, [isOpen, activeTab]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Facturas</DialogTitle>
          <DialogDescription>
            Sube archivos o usa tu cámara para importar facturas a la plataforma.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
            <TabsTrigger value="camera">Capturar con Cámara</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="pt-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="file-upload">Seleccionar Archivo (Excel o PDF)</Label>
                <Input id="file-upload" type="file" onChange={handleFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            </div>
            <Button onClick={handleImport} className="w-full" disabled={!fileName}>
              <UploadCloud className="mr-2 h-4 w-4" />
              Importar Archivo
            </Button>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Nota sobre la importación</AlertTitle>
              <AlertDescription>
                La importación desde Excel/PDF está en desarrollo. Por ahora,
                esto es una simulación.
              </AlertDescription>
            </Alert>
          </TabsContent>
          <TabsContent value="camera" className="pt-4 space-y-4">
            <div className="relative aspect-video bg-muted rounded-md flex items-center justify-center">
                 <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                    <div className="absolute flex flex-col items-center text-muted-foreground">
                        <VideoOff className="h-12 w-12" />
                        <p className="mt-2 text-sm">Cámara no disponible</p>
                    </div>
                )}
            </div>
             <Button className="w-full" disabled={!hasCameraPermission}>
                <Camera className="mr-2 h-4 w-4" />
                Capturar Foto
            </Button>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
