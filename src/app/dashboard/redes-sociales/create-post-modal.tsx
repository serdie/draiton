
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ImagePlus, Facebook, Instagram, Linkedin, Send, XCircle, RefreshCw } from 'lucide-react';
import { generateSocialPost } from '@/ai/flows/generate-social-post';
import { generateImageForPost } from '@/ai/flows/generate-image-for-post';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState({ facebook: false, instagram: true, linkedin: false });
  
  // AI assistant state
  const [aiObjective, setAiObjective] = useState('');
  const [aiFormat, setAiFormat] = useState('');
  const [aiTone, setAiTone] = useState('');


  const handlePlatformChange = (platform: keyof typeof platforms) => {
    setPlatforms(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleGenerateContent = async (regenerateImageOnly = false) => {
    if (!regenerateImageOnly) {
      if (!aiObjective || !aiFormat || !aiTone) {
          toast({ variant: 'destructive', title: 'Campos requeridos', description: 'Por favor, completa todos los campos de la IA.' });
          return;
      }
      setIsGeneratingText(true);
    }
    
    setIsGeneratingImage(true);

    try {
      let currentText = text;
      if (!regenerateImageOnly) {
        const textResult = await generateSocialPost({
            objective: aiObjective,
            format: aiFormat,
            tone: aiTone
        });
        currentText = textResult.postText;
        setText(currentText);
        toast({ title: 'Texto generado', description: 'La IA ha creado una propuesta de texto.' });
      }

      if (currentText) {
        const imageResult = await generateImageForPost({ prompt: currentText });
        setImage(imageResult.imageUrl);
        toast({ title: 'Imagen generada', description: 'La IA ha creado una imagen para tu publicación.' });
      }

    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Error de IA', description: 'No se pudo generar el contenido.' });
    } finally {
        setIsGeneratingText(false);
        setIsGeneratingImage(false);
    }
  }

  const handleSchedulePost = () => {
    if (!text) {
        toast({ variant: 'destructive', title: 'Error', description: 'El texto de la publicación no puede estar vacío.' });
        return;
    }
     if (!Object.values(platforms).some(p => p)) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes seleccionar al menos una red social.' });
        return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
        toast({
            title: 'Publicación Programada (Simulación)',
            description: 'Tu publicación ha sido añadida al calendario.',
        });
        setIsLoading(false);
        onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear/Programar Publicación</DialogTitle>
          <DialogDescription>
            Redacta tu contenido, elige tus plataformas y déjalo listo para publicar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 -mr-6 pr-6 py-4">
            {/* Left Column: Editor */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="post-text">Texto de la Publicación</Label>
                    <Textarea id="post-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="¿Qué quieres compartir?" rows={8} />
                </div>
                 <div className="space-y-2">
                    <Label>Imagen</Label>
                     <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    {image ? (
                         <div className="relative group">
                            <Image src={image} alt="Vista previa de la publicación" width={400} height={400} className="rounded-md w-full object-contain border" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                                <Button variant="destructive" size="icon" onClick={() => setImage(null)}>
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button variant="outline" className="w-full h-24 border-dashed" onClick={triggerImageUpload}>
                            <ImagePlus className="mr-2 h-5 w-5 text-muted-foreground" />
                            Seleccionar imagen
                        </Button>
                    )}
                </div>
            </div>

            {/* Right Column: AI & Platforms */}
            <div className="space-y-6">
                <div className="p-4 border rounded-lg bg-secondary/50 space-y-4">
                     <h3 className="font-semibold text-base flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Asistente de Contenido IA
                    </h3>
                    <div className="space-y-2">
                        <Label htmlFor="ai-objective">Objetivo</Label>
                        <Input id="ai-objective" value={aiObjective} onChange={e => setAiObjective(e.target.value)} placeholder="Ej: Promocionar nuevo producto" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="ai-format">Formato</Label>
                        <Select value={aiFormat} onValueChange={setAiFormat}>
                            <SelectTrigger id="ai-format"><SelectValue placeholder="Ej: Post de Instagram" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Post de Instagram">Post de Instagram</SelectItem>
                                <SelectItem value="Post de Facebook">Post de Facebook</SelectItem>
                                <SelectItem value="Post de LinkedIn">Post de LinkedIn</SelectItem>
                                <SelectItem value="Hilo de Twitter/X">Hilo de Twitter/X</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="ai-tone">Tono</Label>
                         <Select value={aiTone} onValueChange={setAiTone}>
                            <SelectTrigger id="ai-tone"><SelectValue placeholder="Ej: Profesional" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Profesional">Profesional</SelectItem>
                                <SelectItem value="Divertido">Divertido</SelectItem>
                                <SelectItem value="Informativo">Informativo</SelectItem>
                                <SelectItem value="Cercano">Cercano</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex gap-2">
                        <Button onClick={() => handleGenerateContent(false)} disabled={isGeneratingText || isGeneratingImage} className="w-full">
                            {isGeneratingText ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generar
                        </Button>
                        {text && (
                          <Button variant="outline" size="icon" onClick={() => handleGenerateContent(true)} disabled={isGeneratingImage}>
                            {isGeneratingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                          </Button>
                        )}
                     </div>
                </div>
                <div className="p-4 border rounded-lg space-y-4">
                     <h3 className="font-semibold text-base">Publicar en</h3>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="platform-facebook" checked={platforms.facebook} onCheckedChange={() => handlePlatformChange('facebook')} />
                        <Label htmlFor="platform-facebook" className="flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-600"/> Facebook</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="platform-instagram" checked={platforms.instagram} onCheckedChange={() => handlePlatformChange('instagram')} />
                        <Label htmlFor="platform-instagram" className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-500"/> Instagram</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="platform-linkedin" checked={platforms.linkedin} onCheckedChange={() => handlePlatformChange('linkedin')} />
                        <Label htmlFor="platform-linkedin" className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-blue-800"/> LinkedIn</Label>
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSchedulePost} disabled={isLoading}>
             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Programar Publicación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
