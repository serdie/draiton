import { extractInvoiceData, ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { ExtractorForm } from './extractor-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExtractorFacturasPage() {
  
  async function getInvoiceData(
    currentState: { output: ExtractInvoiceDataOutput | null; error: string | null },
    formData: FormData
  ): Promise<{ output: ExtractInvoiceDataOutput | null; error: string | null }> {
    "use server";
    
    const invoiceDataUri = formData.get('invoiceDataUri') as string;

    if (!invoiceDataUri) {
      return { output: null, error: "Por favor, sube una imagen de la factura." };
    }

    try {
      const result = await extractInvoiceData({ invoiceDataUri });
      return { output: result, error: null };
    } catch (e: any) {
      console.error(e);
      return { output: null, error: "No se pudo extraer la información. Asegúrate de que la imagen sea clara y vuelve a intentarlo." };
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Extractor de Facturas con IA</h1>
        <p className="text-muted-foreground">
          Sube una imagen o PDF de una factura y la IA extraerá automáticamente toda la información relevante para que la puedas añadir a tu contabilidad.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subir Factura</CardTitle>
          <CardDescription>Puedes subir una foto (JPG, PNG) o un documento PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExtractorForm action={getInvoiceData} />
        </CardContent>
      </Card>
    </div>
  );
}
