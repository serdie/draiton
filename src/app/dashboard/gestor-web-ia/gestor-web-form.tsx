'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Terminal } from 'lucide-react';
import type { AIPoweredWebManagementOutput } from '@/ai/flows/ai-powered-web-management';

type FormState = {
  output: AIPoweredWebManagementOutput | null;
  error: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando Concepto...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generar Concepto</>}
    </Button>
  );
}

export function GestorWebForm({ action }: { action: (currentState: FormState, formData: FormData) => Promise<FormState> }) {
  const initialState: FormState = { output: null, error: null };
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="businessDescription">Descripción del Negocio (*)</Label>
          <Textarea id="businessDescription" name="businessDescription" placeholder="Describe tu negocio, productos, servicios y público objetivo." required rows={5} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteType">Tipo de Sitio Web (*)</Label>
          <Select name="websiteType" required>
            <SelectTrigger id="websiteType">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Página Web</SelectItem>
              <SelectItem value="online store">Tienda Online</SelectItem>
              <SelectItem value="landing page">Landing Page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="designPreferences">Preferencias de Diseño</Label>
          <Textarea id="designPreferences" name="designPreferences" placeholder="Colores, estilo (moderno, minimalista), etc." rows={5}/>
        </div>
        <div className="space-y-2">
          <Label htmlFor="additionalFeatures">Funcionalidades Adicionales</Label>
          <Textarea id="additionalFeatures" name="additionalFeatures" placeholder="Blog, formulario de contacto, e-commerce, etc." rows={5}/>
        </div>
         <div className="space-y-2 md:col-span-2">
          <Label htmlFor="exampleWebsites">Sitios Web de Ejemplo (Opcional)</Label>
          <Input id="exampleWebsites" name="exampleWebsites" placeholder="https://ejemplo1.com, https://ejemplo2.com" />
        </div>
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
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Concepto de Sitio Web Generado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Concepto General</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{state.output.websiteConcept}</p>
            </div>
             <div>
              <h3 className="font-semibold">Secciones Sugeridas</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{state.output.sections}</p>
            </div>
            <div>
              <h3 className="font-semibold">Mejoras Sugeridas</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{state.output.suggestedImprovements}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
