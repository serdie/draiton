
'use client';

import { AiAssistantChat } from '@/app/dashboard/ai-assistant-chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AsistenteIAPage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Asistente IA</h1>
        <p className="text-muted-foreground">
          Tu experto personal en negocios, finanzas y marketing. Hazle cualquier pregunta.
        </p>
      </div>
      <div className="flex-1">
        <AiAssistantChat />
      </div>
    </div>
  );
}
