
'use client';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, Terminal, Newspaper, Handshake, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { FindGrantsAndNewsOutput } from '@/ai/flows/find-grants-and-news';
import type { GenerateGrantTutorialOutput } from '@/ai/flows/generate-grant-tutorial';
import { getGrantTutorialAction, getGrantsAndNewsAction } from './actions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

type FormState = {
  output: FindGrantsAndNewsOutput | null;
  error: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...</> : <><Search className="mr-2 h-4 w-4" /> Buscar Información</>}
    </Button>
  );
}

const GrantItem = ({ grant }: { grant: FindGrantsAndNewsOutput['grants'][0] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tutorialState, setTutorialState] = useState<{ data: GenerateGrantTutorialOutput | null; error: string | null; loading: boolean }>({ data: null, error: null, loading: false });

    const handleGetTutorial = async () => {
        if (tutorialState.data) { // If tutorial is already loaded, just toggle visibility
            setIsOpen(!isOpen);
            return;
        }

        setIsOpen(true);
        setTutorialState({ data: null, error: null, loading: true });
        const result = await getGrantTutorialAction({
            grantTitle: grant.title,
            sourceLink: grant.sourceLink
        });
        setTutorialState({ data: result.data, error: result.error, loading: false });
    };

    return (
         <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="p-3 border rounded-md">
                <h4 className="font-semibold">{grant.title}</h4>
                <p className="text-sm text-muted-foreground my-1">{grant.summary}</p>
                 <div className="flex items-center justify-between mt-2">
                    <Button variant="link" asChild className="p-0 h-auto">
                        <Link href={grant.sourceLink} target="_blank" rel="noopener noreferrer">Ver fuente</Link>
                    </Button>
                    <CollapsibleTrigger asChild>
                         <Button variant="secondary" size="sm" onClick={handleGetTutorial} disabled={tutorialState.loading}>
                            {tutorialState.loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Comencemos
                        </Button>
                    </CollapsibleTrigger>
                </div>
            </div>
            <CollapsibleContent className="px-3 pt-3">
                 <Separator className="mb-3"/>
                 {tutorialState.loading && <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generando guía personalizada...</div>}
                 {tutorialState.error && <Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{tutorialState.error}</AlertDescription></Alert>}
                 {tutorialState.data && (
                    <div className="space-y-4">
                        {tutorialState.data.tutorial.map((step, index) => (
                            <div key={index} className="flex items-start gap-4">
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div className="bg-primary text-primary-foreground rounded-full size-6 flex items-center justify-center font-bold text-xs">{index + 1}</div>
                                    {index < tutorialState.data.tutorial.length - 1 && <div className="w-px h-full bg-border mt-1"></div>}
                                </div>
                                <div>
                                    <p className="font-semibold">{step.step}</p>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
            </CollapsibleContent>
        </Collapsible>
    )
}

export function AyudasForm({ action }: { action: (currentState: FormState, formData: FormData) => Promise<FormState> }) {
  const [state, setState] = useState<FormState>({ output: null, error: null });
  const [isPending, startTransition] = useTransition();
  const { pending } = useFormStatus();

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
            <Label htmlFor="businessSector">Sector</Label>
            <Input id="businessSector" name="businessSector" required placeholder="Ej: Hostelería, Tecnología..." />
        </div>
        <div className="space-y-2">
            <Label htmlFor="businessLocation">Ubicación</Label>
            <Input id="businessLocation" name="businessLocation" required placeholder="Ej: Madrid, Comunidad Valenciana" />
        </div>
        <div className="space-y-2">
            <Label htmlFor="employeeCount">Nº de Empleados</Label>
            <Input id="employeeCount" name="employeeCount" type="number" required placeholder="Ej: 5" />
        </div>
      </div>
       <div className="space-y-2">
          <Label htmlFor="businessDescription">Descripción Breve del Negocio</Label>
          <Textarea id="businessDescription" name="businessDescription" required placeholder="Ej: Cafetería de especialidad enfocada en producto local..." rows={3} />
        </div>
      
      <SubmitButton />

      {pending && (
        <div className="flex items-center justify-center gap-2 text-muted-foreground mt-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Buscando nueva información...</span>
        </div>
      )}

      {state.error && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {!pending && state.output && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Handshake className="h-6 w-6 text-primary"/>
                        <CardTitle>Ayudas y Subvenciones</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {state.output.grants.length > 0 ? state.output.grants.map((item, index) => (
                       <GrantItem key={`grant-${index}`} grant={item} />
                    )) : <p className="text-sm text-muted-foreground">No se encontraron ayudas relevantes.</p>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <Newspaper className="h-6 w-6 text-primary"/>
                        <CardTitle>Noticias de Interés</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {state.output.news.length > 0 ? state.output.news.map((item, index) => (
                        <div key={`news-${index}`} className="p-3 border rounded-md">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground my-1">{item.summary}</p>
                            <Button variant="link" asChild className="p-0 h-auto">
                                <Link href={item.sourceLink} target="_blank" rel="noopener noreferrer">Leer más</Link>
                            </Button>
                        </div>
                    )) : <p className="text-sm text-muted-foreground">No se encontraron noticias relevantes.</p>}
                </CardContent>
            </Card>
        </div>
      )}
    </form>
  );
}
