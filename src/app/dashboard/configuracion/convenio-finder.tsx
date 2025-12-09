
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, Terminal, ExternalLink, CheckCircle } from 'lucide-react';
import { findCollectiveAgreementAction } from './actions';
import type { FindCollectiveAgreementOutput } from '@/ai/flows/find-collective-agreement';
import { provincias } from '@/lib/provincias';
import Link from 'next/link';

type FormState = {
  output: FindCollectiveAgreementOutput | null;
  error: string | null;
};

export function ConvenioFinder({ onSelect }: { onSelect: (convenio: string) => void }) {
  const [state, setState] = useState<FormState>({ output: null, error: null });
  const [scope, setScope] = useState<'nacional' | 'autonomico' | 'provincial'>('nacional');
  const [region, setRegion] = useState('');
  const [province, setProvince] = useState('');
  const [sectorKeyword, setSectorKeyword] = useState('');
  const [isPending, startTransition] = useTransition();
  
  const handleSearch = () => {
      const formData = new FormData();
      formData.append('scope', scope);
      if (region && scope === 'autonomico') formData.append('region', region);
      if (province && scope === 'provincial') formData.append('province', province);
      formData.append('sectorKeyword', sectorKeyword);

      startTransition(async () => {
          setState({ output: null, error: null }); 
          const result = await findCollectiveAgreementAction({ output: null, error: null }, formData);
          setState(result);
      });
  };
  
  return (
    <div className="p-4 border rounded-lg bg-background/50 space-y-6">
        <div className="space-y-4">
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
                        <Select name="region" value={region} onValueChange={setRegion} required>
                            <SelectTrigger id="region"><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                            <SelectContent>
                                {provincias.comunidades.map(c => <SelectItem key={c.nombre} value={c.nombre}>{c.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                 {scope === 'provincial' && (
                    <div className="space-y-2">
                        <Label htmlFor="province">Provincia</Label>
                        <Select name="province" value={province} onValueChange={setProvince} required>
                             <SelectTrigger id="province"><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                             <SelectContent>
                                {provincias.provincias.map(p => <SelectItem key={p.codigo} value={p.nombre}>{p.nombre}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                 <div className="space-y-2 md:col-span-3">
                    <Label htmlFor="sectorKeyword">Sector (Palabra clave)</Label>
                    <Input id="sectorKeyword" name="sectorKeyword" value={sectorKeyword} onChange={(e) => setSectorKeyword(e.target.value)} required placeholder="Ej: Hostelería, Construcción, Metal..." />
                </div>
            </div>
             <Button type="button" onClick={handleSearch} disabled={isPending}>
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando...</> : <><Search className="mr-2 h-4 w-4" /> Buscar Convenio</>}
            </Button>
        </div>

         {isPending && (
             <div className="flex items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando convenios en fuentes oficiales...
             </div>
         )}

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
