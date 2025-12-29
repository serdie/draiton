
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, Send, Loader2, Upload } from 'lucide-react';
import { type MessageData } from 'genkit/model';
import { askBusinessAssistantAction } from './asistente-ia/actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';


type Message = {
    role: 'user' | 'model';
    text: string;
};

export function AiAssistantChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const [documentContent, setDocumentContent] = useState<string | null>(null);
    const [documentName, setDocumentName] = useState<string | null>(null);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            }
        }
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages, isPending]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        let userMessageText = input;
        if(documentName) {
            userMessageText = `Archivo adjunto: ${documentName}\n\n${input}`;
        }
        const userMessage: Message = { role: 'user', text: userMessageText };

        setMessages(prev => [...prev, userMessage]);
        
        const history: MessageData[] = messages.map(msg => ({
            role: msg.role,
            content: [{ text: msg.text }]
        }));

        startTransition(async () => {
            const result = await askBusinessAssistantAction(history, input, documentContent);
            if (result.response) {
                setMessages(prev => [...prev, { role: 'model', text: result.response }]);
            } else if (result.error) {
                setMessages(prev => [...prev, { role: 'model', text: `Error: ${result.error}` }]);
            }
        });

        setInput('');
        setDocumentContent(null);
        setDocumentName(null);
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setDocumentContent(text);
                setDocumentName(file.name);
                toast({
                    title: "Archivo cargado",
                    description: `"${file.name}" está listo para ser analizado. Escribe tu consulta y envíala.`,
                });
            };
            reader.onerror = () => {
                toast({
                    variant: "destructive",
                    title: "Error al leer el archivo",
                    description: "No se pudo procesar el archivo seleccionado.",
                });
            };
            reader.readAsText(file);
        }
        // Reset file input to allow selecting the same file again
        event.target.value = '';
    };

  return (
    <>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary"/>
                Asistente IA
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                 <div className="space-y-4 pr-4">
                    <div className="p-4 bg-secondary rounded-lg flex items-start gap-3 w-fit max-w-lg">
                        <div className="flex-shrink-0 size-8 bg-primary/20 text-primary flex items-center justify-center rounded-full">
                            <Sparkles className="h-5 w-5"/>
                        </div>
                        <p className="text-sm text-secondary-foreground pt-1.5">
                            ¡Hola! Soy tu asistente. Pregúntame sobre impuestos, facturas, o sube un documento para que lo analice.
                        </p>
                    </div>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="flex-shrink-0 size-8 bg-primary/20 text-primary flex items-center justify-center rounded-full">
                                <Sparkles className="h-5 w-5"/>
                                </div>
                            )}
                            <p className={`text-sm p-3 rounded-lg max-w-lg whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                {msg.text}
                            </p>
                        </div>
                    ))}
                    {isPending && (
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 size-8 bg-primary/20 text-primary flex items-center justify-center rounded-full">
                                <Sparkles className="h-5 w-5"/>
                            </div>
                            <p className="text-sm p-3 rounded-lg bg-secondary flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                <span>Pensando...</span>
                            </p>
                        </div>
                    )}
                 </div>
            </ScrollArea>
        </CardContent>
        <CardFooter>
             <form onSubmit={handleSubmit} className="relative w-full">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".txt,.csv,.json,.md"
                />
                <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={documentName ? `Preguntar sobre ${documentName}` : "Escribe tu consulta o sube un documento..."} 
                    className="pr-24 h-12"
                    disabled={isPending}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" disabled={isPending} onClick={handleUploadClick}>
                        <Upload className="h-5 w-5" />
                    </Button>
                    <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </form>
        </CardFooter>
    </>
  )
}

    
