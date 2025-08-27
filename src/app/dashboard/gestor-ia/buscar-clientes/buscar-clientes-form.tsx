
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, Terminal, Building2, ExternalLink } from 'lucide-react';
import type { FindPotentialClientsOutput } from '@/ai/flows/find-potential-clients';
import { Input } from '@/components/ui/input';

type FormState = {
  output: FindPotentialClientsOutput | null;
  error: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Buscando Clientes...</> : <><Search className="mr-2 h-4 w-4" /> Buscar Clientes</>}
    </Button>
  );
}

export function BuscarClientesForm({ action }: { action: (currentState: FormState, formData: FormData) => Promise<FormState> }) {
  const initialState: FormState = { output: null, error: null };
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="productsAndServices">Tus Productos/Servicios</Label>
                <Textarea id="productsAndServices" name="productsAndServices" required placeholder="Ej: Ofrecemos consultoría de marketing digital especializada en SEO para pequeñas empresas." rows={4} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="existingClientProfile">Perfil de tu Cliente Ideal</Label>
                <Textarea id="existingClientProfile" name="existingClientProfile" required placeholder="Ej: Clínicas dentales, despachos de abogados, restaurantes con 5-20 empleados." rows={4} />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="companyLocation">Tu Ubicación (Ciudad/Región)</Label>
            <Input id="companyLocation" name="companyLocation" required placeholder="Ej: Valencia, España" />
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
        <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Clientes Potenciales Encontrados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.output.potentialClients.length > 0 ? state.output.potentialClients.map((client, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-md">
                                    <Building2 className="h-5 w-5 text-muted-foreground"/>
                                </div>
                                <CardTitle className="text-base">{client.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm flex-grow">
                            <p className="text-muted-foreground italic">{client.profile}</p>
                            <p><strong className="font-medium">¿Por qué es un buen cliente?</strong> {client.reasoning}</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="link" asChild className="p-0 h-auto">
                                <Link href={client.website} target="_blank" rel="noopener noreferrer">
                                    Visitar web <ExternalLink className="ml-2 h-3 w-3" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                )) : <p className="text-sm text-muted-foreground col-span-full">No se encontraron clientes potenciales con estos criterios.</p>}
            </div>
        </div>
      )}
    </form>
  );
}
