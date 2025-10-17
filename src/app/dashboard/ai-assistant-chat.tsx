
'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { type MessageData } from 'genkit/model';
import { askBusinessAssistantAction } from './asistente-ia/actions';
import { ScrollArea } from '@/components/ui/scroll-area';


type Message = {
    role: 'user' | 'model';
    text: string;
};

export function AiAssistantChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages, isPending]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        
        const history: MessageData[] = messages.map(msg => ({
            role: msg.role,
            content: [{ text: msg.text }]
        }));

        startTransition(async () => {
            const result = await askBusinessAssistantAction(history, input);
            if (result.response) {
                setMessages(prev => [...prev, { role: 'model', text: result.response }]);
            } else if (result.error) {
                setMessages(prev => [...prev, { role: 'model', text: `Error: ${result.error}` }]);
            }
        });

        setInput('');
    }

  return (
    <Card className="flex flex-col h-full max-h-[calc(100vh-200px)]">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary"/>
                Chatea con GestorIA
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
                            ¡Hola! Soy GestorIA. Pregúntame sobre impuestos, facturas, o cómo optimizar tu negocio.
                        </p>
                    </div>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && (
                                <div className="flex-shrink-0 size-8 bg-primary/20 text-primary flex items-center justify-center rounded-full">
                                <Sparkles className="h-5 w-5"/>
                                </div>
                            )}
                            <p className={`text-sm p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
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
                <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu consulta..." 
                    className="pr-12 h-12"
                    disabled={isPending}
                />
                <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" disabled={isPending}>
                    <Send className="h-5 w-5" />
                </Button>
            </form>
        </CardFooter>
    </Card>
  )
}
