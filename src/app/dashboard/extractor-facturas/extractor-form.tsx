'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ScanLine, Terminal } from 'lucide-react';
import Image from 'next/image';
import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';

type FormState = {
  output: ExtractInvoiceDataOutput | null;
  error: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extrayendo...</> : <><ScanLine className="mr-2 h-4 w-4" /> Extraer Datos</>}
    </Button>
  );
}

export function ExtractorForm({ action }: { action: (currentState: FormState, formData: FormData) => Promise<FormState> }) {
  const initialState: FormState = { output: null, error: null };
  const [state, formAction] = useActionState(action, initialState);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invoiceFile">Archivo de la factura</Label>
        <Input id="invoiceFile" name="invoiceFile" type="file" accept="image/*,application/pdf" onChange={handleFileChange} required />
        <input type="hidden" name="invoiceDataUri" value={filePreview || ''} />
      </div>

      {filePreview && (
        <div className="mt-4 border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Vista Previa:</p>
            <Image data-ai-hint="invoice document" src={filePreview} alt="Vista previa de la factura" width={200} height={280} className="rounded-md object-contain max-h-[280px] w-auto"/>
        </div>
      )}

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
            <CardTitle>Datos Extraídos de la Factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div><p className="font-semibold">Nº Factura:</p><span>{state.output.invoiceNumber}</span></div>
              <div><p className="font-semibold">Fecha:</p><span>{state.output.invoiceDate}</span></div>
              <div><p className="font-semibold">Proveedor:</p><span>{state.output.supplierName}</span></div>
              <div><p className="font-semibold">Cliente:</p><span>{state.output.clientName}</span></div>
              <div><p className="font-semibold">Total:</p><span className="font-bold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: state.output.currency || 'EUR' }).format(state.output.totalAmount)}</span></div>
            </div>
            
            <h4 className="font-semibold pt-4">Líneas de la factura</h4>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Cantidad</TableHead>
                        <TableHead className="text-right">P. Unitario</TableHead>
                        <TableHead className="text-right">Importe</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {state.output.lineItems.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: state.output.currency || 'EUR' }).format(item.unitPrice)}</TableCell>
                            <TableCell className="text-right">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: state.output.currency || 'EUR' }).format(item.amount)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
