
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles, Send, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateEmailCampaign, type GenerateEmailCampaignOutput } from '@/ai/flows/generate-email-campaign';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function CreateCampaignPage() {
  const { toast } = useToast();
  
  // Campaign form state
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // AI Assistant state
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiTone, setAiTone] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);


  const handleGenerateWithAI = async () => {
    if (!aiGoal || !aiTone) {
        toast({
            variant: 'destructive',
            title: 'Campos requeridos',
            description: 'Por favor, define el objetivo y el tono para la IA.'
        });
        return;
    }
    setIsGenerating(true);
    setAiError(null);

    try {
        const result = await generateEmailCampaign({
            campaignGoal: aiGoal,
            targetAudience: 'Clientes existentes y potenciales',
            tone: aiTone,
        });
        setSubject(result.subject);
        setBody(result.body);
        setIsAiOpen(false);
        toast({
            title: 'Contenido generado por IA',
            description: 'El asunto y el cuerpo del correo han sido actualizados.'
        });
    } catch(e) {
        console.error(e);
        setAiError('No se pudo generar el contenido. Inténtalo de nuevo.');
    } finally {
        setIsGenerating(false);
    }

  };

  const handleSendCampaign = () => {
    // Logic to send campaign
    toast({
      title: 'Campaña enviada (Simulación)',
      description: 'Tu campaña de correo electrónico ha sido puesta en la cola para su envío.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/marketing/campanas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crear Nueva Campaña de Email</h1>
          <p className="text-muted-foreground">
            Diseña tu correo, define tu audiencia y prepárate para enviar.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido del Correo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: ¡Novedades importantes en tu cuenta!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Cuerpo del Correo</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Escribe aquí el contenido de tu correo..."
                  rows={15}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6 sticky top-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de la Campaña</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Nombre de la Campaña (interno)</Label>
                <Input
                  id="campaign-name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Ej: Newsletter Julio"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Audiencia</Label>
                <Select>
                    <SelectTrigger id="audience">
                        <SelectValue placeholder="Seleccionar audiencia" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los contactos</SelectItem>
                        <SelectItem value="clients">Solo Clientes</SelectItem>
                        <SelectItem value="leads">Solo Leads</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
           <Card className="bg-secondary/70">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary"/> Asistente IA
                    </CardTitle>
                     <Button variant={isAiOpen ? 'secondary' : 'outline'} size="sm" onClick={() => setIsAiOpen(!isAiOpen)}>
                        {isAiOpen ? 'Cerrar' : 'Abrir'}
                    </Button>
                </div>
                <CardDescription>Genera el contenido de tu correo con IA.</CardDescription>
            </CardHeader>
            {isAiOpen && (
                 <CardContent className="space-y-4">
                     {aiError && (
                         <Alert variant="destructive">
                             <AlertTitle>Error</AlertTitle>
                             <AlertDescription>{aiError}</AlertDescription>
                         </Alert>
                     )}
                     <div className="space-y-2">
                         <Label htmlFor="ai-goal">Objetivo del correo</Label>
                         <Input id="ai-goal" value={aiGoal} onChange={(e) => setAiGoal(e.target.value)} placeholder="Ej: Anunciar un 20% de descuento."/>
                     </div>
                     <div className="space-y-2">
                         <Label htmlFor="ai-tone">Tono</Label>
                         <Select value={aiTone} onValueChange={setAiTone}>
                            <SelectTrigger id="ai-tone"><SelectValue placeholder="Selecciona un tono" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Profesional">Profesional</SelectItem>
                                <SelectItem value="Amigable">Amigable</SelectItem>
                                <SelectItem value="Urgente">Urgente</SelectItem>
                                <SelectItem value="Informativo">Informativo</SelectItem>
                                <SelectItem value="Persuasivo">Persuasivo</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                      <Button className="w-full" onClick={handleGenerateWithAI} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                        {isGenerating ? 'Generando...' : 'Generar contenido'}
                    </Button>
                 </CardContent>
            )}
          </Card>

          <Button size="lg" className="w-full" onClick={handleSendCampaign}>
            <Send className="mr-2 h-4 w-4" />
            Enviar Campaña
          </Button>
        </div>
      </div>
    </div>
  );
}
