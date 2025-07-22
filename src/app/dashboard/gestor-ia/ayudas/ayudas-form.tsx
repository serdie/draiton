'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, Terminal, Newspaper, Handshake } from 'lucide-react';
import type { FindGrantsAndNewsOutput } from '@/ai/flows/find-grants-and-news';

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

export function AyudasForm({ action }: { action: (currentState: FormState, formData: FormData) => Promise<FormState> }) {
  const initialState: FormState = { output: null, error: null };
  const [state, formAction] = useActionState(action, initialState);

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

      {state.error && (
        <Alert variant="destructive" className="mt-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.output && (
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
                        <div key={`grant-${index}`} className="p-3 border rounded-md">
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground my-1">{item.summary}</p>
                            <Button variant="link" asChild className="p-0 h-auto">
                                <Link href={item.sourceLink} target="_blank" rel="noopener noreferrer">Ver fuente</Link>
                            </Button>
                        </div>
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