
import { ExtractorForm } from './extractor-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getInvoiceData } from './actions';

export default function ExtractorFacturasPage() {
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
