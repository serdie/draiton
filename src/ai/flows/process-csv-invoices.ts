'use server';

/**
 * @fileOverview Flujo de Genkit para procesar un archivo CSV de facturas.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Descripciones en español) ---

const ProcessCsvInvoicesInputSchema = z.object({
  csvContent: z.string().describe('El contenido completo del archivo CSV como texto.'),
});
export type ProcessCsvInvoicesInput = z.infer<typeof ProcessCsvInvoicesInputSchema>;

// Ajustamos descripciones a español
const InvoiceSchema = z.object({
  numero: z.string().describe('El número de la factura.'),
  fechaEmision: z.string().describe('La fecha de emisión en formato AAAA-MM-DD.'),
  fechaVto: z.string().optional().describe('La fecha de vencimiento en formato AAAA-MM-DD (opcional).'),
  cliente: z.string().describe('El nombre del cliente.'),
  subtotal: z.number().describe('El importe neto (base imponible) de la factura.'),
  impuestos: z.number().describe('El importe total de impuestos (IVA/IGIC).'),
  total: z.number().describe('El importe total de la factura.'),
  estado: z.string().describe('El estado de pago de la factura (ej. "Pagada", "Pendiente").'),
  moneda: z.string().describe('La moneda de la factura (ej. EUR, USD).'),
});

const ProcessCsvInvoicesOutputSchema = z.object({
  invoices: z.array(InvoiceSchema).describe('Lista de las facturas procesadas desde el CSV.'),
});
export type ProcessCsvInvoicesOutput = z.infer<typeof ProcessCsvInvoicesOutputSchema>;

export async function processCsvInvoices(input: ProcessCsvInvoicesInput): Promise<ProcessCsvInvoicesOutput> {
  return processCsvInvoicesFlow(input);
}

// --- PROMPT (Instrucciones en español, el modelo se añade en el flow) ---
const prompt = ai.definePrompt({
  name: 'processCsvInvoicesPrompt',
  input: { schema: ProcessCsvInvoicesInputSchema },
  output: { schema: ProcessCsvInvoicesOutputSchema },
  prompt: `Eres un experto procesador de datos. Tu tarea es analizar el contenido CSV proporcionado, que contiene múltiples facturas, y convertirlo a un formato JSON estructurado.

Las cabeceras del CSV proporcionadas son: "N.º de factura", "Fecha", "Descripción", "Vencimiento", "Importe neto", "Recargo Equivalencia", "Retención", "Importe de IGIC", "Importe total", "Moneda", "Tipo de cambio", "Divisa contabilizada", "Importe neto contabilizado", "IVA contabilizado", "Importe total contabilizado", "Estado de pago", "Pagos y cobros (método, importe, fecha, notas)", "Cliente", "N.º de cliente", "CIF/NIF", "Fiscal code", "País", "VAT due mode", "Zona".

- Mapea "N.º de factura" a "numero".
- Mapea "Fecha" a "fechaEmision" (formato AAAA-MM-DD).
- Mapea "Vencimiento" a "fechaVto" (formato AAAA-MM-DD).
- Mapea "Cliente" a "cliente".
- Mapea "Importe neto" a "subtotal" (como número).
- Mapea "IVA contabilizado" a "impuestos" (como número).
- Mapea "Importe total" a "total" (como número).
- Mapea "Estado de pago" a "estado".
- Mapea "Moneda" a "moneda".

Ignora las demás columnas. Asegúrate de que las fechas estén en formato AAAA-MM-DD y los importes sean números.

Aquí está el contenido del CSV:
{{{csvContent}}}

Procesa cada fila y devuelve el array JSON estructurado ('invoices'). Responde ÚNICAMENTE con el JSON.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const processCsvInvoicesFlow = ai.defineFlow(
  {
    name: 'processCsvInvoicesFlow',
    inputSchema: ProcessCsvInvoicesInputSchema,
    outputSchema: ProcessCsvInvoicesOutputSchema,
  },
  async (input: ProcessCsvInvoicesInput) => { // Añadimos tipo a input
    try {
      // 1. Llamamos al prompt especificando el modelo
      const { output } = await prompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'), // Modelo añadido aquí
      });

      // 2. Validamos la salida con safeParse
      const parsed = ProcessCsvInvoicesOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de Zod en processCsvInvoices:', parsed.error);
        throw new Error('La IA ha devuelto la lista de facturas con formato inesperado.');
      }
      
      return parsed.data; // Devolvemos los datos validados

    } catch (error) {
      // 3. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en processCsvInvoicesFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudieron procesar las facturas del CSV. Error: ${message}`);
    }
  }
);