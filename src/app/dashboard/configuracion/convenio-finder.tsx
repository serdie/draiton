
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, Terminal, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';
import { findCollectiveAgreementAction } from './actions';
import type { FindCollectiveAgreementOutput } from '@/ai/flows/find-collective-agreement';
import { useState } from 'react';
import { provincias } from '@/lib/provincias';
import Link from 'next/link';

type FormState = {
  output: FindCollectiveAgreementOutput | null;
  error: string | null;
};

const comunidadesAutonomas = [
  "Andalucía", "Aragón", "Asturias", "Islas Baleares", "Canarias", "Cantabria", 
  "Castilla y León", "Castilla-La Mancha", "Cataluña", "Comunidad Valenciana", 
  "Extremadura", "Galicia", "Madrid", "Murcia", "Navarra", "País Vasco", "La Rioja",
  "Ceuta", "Melilla"
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...</> : <><Search className="mr-2 h-4 w-4" /> Buscar Convenio</>}
    </Button>
  );
}

export function ConvenioFinder({ onSelect }: { onSelect: (convenio: string) => void }) {
  const initialState: FormState = { output: null, error: null };
  const [state, formAction] = useActionState(findCollectiveAgreementAction, initialState);
  const [scope, setScope] = useState<'nacional' | 'autonomico' | 'provincial'>('nacional');

  return (
    <div className="p-4 border rounded-lg bg-background/50 space-y-6">
        <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="scope">Ámbito</Label>
                    <Select name="scope" value={scope} onValueChange={(v) => setScope(v as any)} required>
                        <SelectTrigger id="scope"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nacional">Nacional</SelectItem>
                            <SelectItem value="autonomico">Autonómico</SelectItem>
                            <SelectItem value="provincial">Provincial</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 {scope === 'autonomico' && (
                    <div className="space-y-2">
                        <Label htmlFor="region">Comunidad Autónoma</Label>
                        <Select name="region" required>
                            <SelectTrigger id="region"><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                            <SelectContent>
                                {comunidadesAutonomas.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                 {scope === 'provincial' && (
                    <div className="space-y-2">
                        <Label htmlFor="province">Provincia</Label>
                        <Select name="province" required>
                             <SelectTrigger id="province"><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                             <SelectContent>
                                {provincias.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                 <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="sectorKeyword">Sector (Palabra clave)</Label>
                    <Input id="sectorKeyword" name="sectorKeyword" required placeholder="Ej: Hostelería, Construcción, Metal..." />
                </div>
            </div>
            <SubmitButton />
        </form>

         {state.error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error en la búsqueda</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}

        {state.output && (
            <div>
                <h4 className="font-semibold mb-2">Resultados de la Búsqueda</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {state.output.agreements.length > 0 ? (
                        state.output.agreements.map((agreement, index) => (
                        <div key={index} className="p-3 border rounded-md flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className="font-medium text-sm">{agreement.title}</p>
                                <p className="text-xs text-muted-foreground">Publicado: {agreement.publicationDate}</p>
                                <Button variant="link" asChild size="sm" className="h-auto p-0 mt-1 text-xs">
                                    <Link href={agreement.sourceLink} target="_blank" rel="noopener noreferrer">
                                        Ver documento oficial <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => onSelect(agreement.title)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Seleccionar
                            </Button>
                        </div>
                    ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No se encontraron convenios con esos criterios.</p>
                    )}
                </div>
            </div>
        )}
    </div>
  );
}
