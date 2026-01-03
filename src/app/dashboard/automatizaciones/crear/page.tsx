
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, GripVertical, Plus, Save, Trash2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TriggerSelector, type Trigger } from './trigger-selector';
import { ActionCard, type Action } from './action-card';
import { ActionSelector } from './action-selector';

export default function CrearAutomatizacionPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const { toast } = useToast();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const addAction = (action: Action) => {
    setActions([...actions, { ...action, id: `action-${typeof window !== 'undefined' ? Date.now() : 'server'}` }]);
    setIsActionModalOpen(false);
  };

  const removeAction = (id: string) => {
    setActions(actions.filter((action) => action.id !== id));
  };
  
  const handleSave = () => {
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor, asigna un nombre a la automatización.',
      });
      return;
    }
     if (!trigger) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor, selecciona un disparador para el flujo.',
      });
      return;
    }
    if (actions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Por favor, añade al menos una acción.',
      });
      return;
    }
    
    // Here you would save the workflow to your backend
    console.log({ name, description, trigger, actions });
    
    toast({
      title: 'Flujo Guardado (Simulación)',
      description: `La automatización "${name}" ha sido guardada.`,
    });
  }

  return (
    <>
    <ActionSelector
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onSelectAction={addAction}
    />
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/automatizaciones">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Crear Nueva Automatización</h1>
          <p className="text-muted-foreground">
            Define un disparador y una secuencia de acciones para tu flujo de trabajo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Workflow Steps */}
          <Card>
            <CardHeader>
              <CardTitle>1. Disparador (Trigger)</CardTitle>
              <CardDescription>Elige el evento que iniciará tu automatización.</CardDescription>
            </CardHeader>
            <CardContent>
              <TriggerSelector selectedTrigger={trigger} onSelectTrigger={setTrigger} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Acciones</CardTitle>
              <CardDescription>Añade los pasos que se ejecutarán después del disparador.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {actions.map((action, index) => (
                <div key={action.id} className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab"/>
                    <ActionCard 
                        action={action} 
                        onRemove={() => removeAction(action.id)}
                    />
                </div>
              ))}
              <Button variant="outline" onClick={() => setIsActionModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Añadir Acción
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6 sticky top-6">
          {/* Settings & Save */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flow-name">Nombre del Flujo</Label>
                <Input
                  id="flow-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Guardar facturas de Gmail"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flow-description">Descripción (Opcional)</Label>
                <Textarea
                  id="flow-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Una breve descripción de lo que hace este flujo."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          <Button size="lg" className="w-full" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar y Activar
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
