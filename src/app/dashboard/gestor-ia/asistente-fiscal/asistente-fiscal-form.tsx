
'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Terminal, FileText, Info } from 'lucide-react';
import type { FiscalAssistantOutput } from '@/ai/flows/fiscal-assistant';

type FormState = {
  output: FiscalAssistantOutput | null;
  error: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando Guía...</> : <><Sparkles className="mr-2 h-4 w-4" /> Obtener Ayuda</>}
    </Button>
  );
}

export function AsistenteFiscalForm({ action }: { action: (currentState: FormState, formData: FormData) => Promise<FormState> }) {
  const [state, setState] = useState<FormState>({ output: null, error: null });
  const [isPending, startTransition] = useTransition();

  const formAction = async (formData: FormData) => {
    startTransition(async () => {
      const result = await action(state, formData);
      setState(result);
    });
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="taxModel">Modelo Fiscal (*)</Label>
          <Select name="taxModel" required>
            <SelectTrigger id="taxModel">
              <SelectValue placeholder="Selecciona un modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Modelo 303 (IVA)">Modelo 303 (IVA)</SelectItem>
              <SelectItem value="Modelo 130 (IRPF)">Modelo 130 (IRPF)</SelectItem>
              <SelectItem value="Modelo 111 (Retenciones)">Modelo 111 (Retenciones)</SelectItem>
              <SelectItem value="Modelo 347 (Operaciones con terceros)">Modelo 347 (Operaciones con terceros)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
            <Label htmlFor="income">Ingresos (Base imponible) (*)</Label>
            <Input id="income" name="income" type="number" step="0.01" required placeholder="Ej: 15000" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="expenses">Gastos Deducibles (Base imponible) (*)</Label>
            <Input id="expenses" name="expenses" type="number" step="0.01" required placeholder="Ej: 5500"/>
        </div>
      </div>
       <div className="space-y-2">
          <Label htmlFor="notes">Notas adicionales (Opcional)</Label>
          <Textarea id="notes" name="notes" placeholder="Tengo IVA de importación, ¿cómo lo incluyo?" rows={2} />
        </div>
      
      <SubmitButton />

      {state.error && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.output && (
        <Card className="mt-6 border-primary/50">
          <CardHeader>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-lg">
                    <FileText className="h-6 w-6"/>
                </div>
                <div>
                    <CardTitle>Guía para el {state.output.modelSummary}</CardTitle>
                    <CardDescription>{state.output.modelSummary}</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Instrucciones Clave</h3>
              <div className="space-y-3">
                {state.output.instructions.map((step, index) => (
                    <div key={index} className="p-4 border rounded-md bg-background/50">
                        <p className="font-semibold">Casilla {step.field}</p>
                        <p className="text-primary font-bold text-xl">{step.value}</p>
                        <p className="text-sm text-muted-foreground mt-1">{step.explanation}</p>
                    </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-400/10 rounded-r-md">
                <p className="font-bold text-yellow-300">Resultado Final: {state.output.finalResult}</p>
            </div>
             <div>
              <h3 className="font-semibold text-lg mb-2">Notas Importantes</h3>
              <div className="flex items-start gap-3 p-4 border rounded-md text-sm bg-background/50">
                <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <p className="text-muted-foreground whitespace-pre-wrap">{state.output.importantNotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
