'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Sparkles, Terminal } from 'lucide-react';
import type { GenerateBusinessIdeasOutput } from '@/ai/flows/generate-business-ideas';

type FormState = {
  output: GenerateBusinessIdeasOutput | null;
  error: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
         <Sparkles className="mr-2 h-4 w-4" />
          Generar Ideas
        </>
      )}
    </Button>
  );
}

export function BusinessIdeasForm({ action }: { action: (currentState: FormState, formData: FormData) => Promise<FormState> }) {
  const initialState: FormState = { output: null, error: null };
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Textarea
        name="companyData"
        placeholder="Ej: Somos una cafetería de especialidad en el centro de la ciudad. Ofrecemos café de origen único, pastelería artesanal y un espacio acogedor para trabajar..."
        rows={6}
        required
      />
      <SubmitButton />

      {state.error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.output && state.output.suggestions && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="text-accent" />
              Sugerencias para tu negocio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {state.output.suggestions.map((suggestion, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="font-medium text-left">{suggestion.title}</AccordionTrigger>
                  <AccordionContent>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                      {suggestion.details}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
