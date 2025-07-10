'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Clock, Mail, Rss, Settings, Webhook, Zap } from 'lucide-react';

export type Trigger = {
  id: string;
  type: 'schedule' | 'webhook' | 'gmail' | 'blog';
  title: string;
  description: string;
  icon: React.ReactNode;
};

const availableTriggers: Trigger[] = [
  { id: 'schedule', type: 'schedule', title: 'Programado', description: 'Ejecutar en un intervalo fijo (cada hora, día...).', icon: <Clock /> },
  { id: 'webhook', type: 'webhook', title: 'Webhook', description: 'Iniciar cuando se recibe una petición HTTP.', icon: <Webhook /> },
  { id: 'gmail', type: 'gmail', title: 'Nuevo Email en Gmail', description: 'Se activa cuando llega un nuevo correo.', icon: <Mail /> },
  { id: 'blog', type: 'blog', title: 'Nuevo Post de Blog', description: 'Se activa al publicar una nueva entrada.', icon: <Rss /> },
];

interface TriggerSelectorProps {
  selectedTrigger: Trigger | null;
  onSelectTrigger: (trigger: Trigger) => void;
}

export function TriggerSelector({ selectedTrigger, onSelectTrigger }: TriggerSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTriggers = availableTriggers.filter((trigger) =>
    trigger.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (trigger: Trigger) => {
    onSelectTrigger(trigger);
    setIsModalOpen(false);
  };

  return (
    <>
      {!selectedTrigger ? (
        <Button variant="outline" onClick={() => setIsModalOpen(true)}>
          <Zap className="mr-2 h-4 w-4" />
          Seleccionar Disparador
        </Button>
      ) : (
        <Card className="bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-accent">{selectedTrigger.icon}</div>
              <div>
                <CardTitle className="text-lg">{selectedTrigger.title}</CardTitle>
                <CardDescription>{selectedTrigger.description}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon"><Settings className="h-4 w-4"/></Button>
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>Cambiar</Button>
            </div>
          </CardHeader>
        </Card>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Elige un Disparador</DialogTitle>
            <DialogDescription>
              Selecciona el evento que pondrá en marcha tu automatización.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <Input
              placeholder="Buscar disparador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
              {filteredTriggers.map((trigger) => (
                <Card
                  key={trigger.id}
                  className="cursor-pointer hover:border-primary hover:shadow-md transition-all"
                  onClick={() => handleSelect(trigger)}
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="text-primary">{trigger.icon}</div>
                    <div>
                      <CardTitle className="text-base">{trigger.title}</CardTitle>
                      <CardDescription>{trigger.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
