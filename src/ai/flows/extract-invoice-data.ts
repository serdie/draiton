'use server';

/**
 * @fileOverview Flujo de Genkit para extraer datos de una imagen de factura.
 * (Versión final corregida, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Descripciones en español) ---

const ExtractInvoiceDataInputSchema = z.object({
  invoiceDataUri: z
    .string()
    .describe(
      "Una foto o documento de una factura, como data URI (Base64 con MIME type). Formato esperado: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractInvoiceDataInput = z.infer<typeof ExtractInvoiceDataInputSchema>;

// Ajustamos descripciones a español
const ExtractInvoiceDataOutputSchema = z.object({
  invoiceNumber: z.string().describe('El número de factura.'),
  invoiceDate: z.string().describe('La fecha de la factura en formato AAAA-MM-DD.'),
  dueDate: z.string().optional().describe('La fecha de vencimiento en formato AAAA-MM-DD (opcional).'),
  supplierName: z.string().describe('El nombre del proveedor/emisor.'),
  clientName: z.string().describe('El nombre del cliente/receptor.'),
  clientAddress: z.string().optional().describe('La dirección completa del cliente (opcional).'),
  clientCif: z.string().optional().describe('El CIF/NIF del cliente (opcional).'),
  subtotal: z.number().optional().describe('La base imponible (importe antes de impuestos, opcional).'),
  taxAmount: z.number().optional().describe('El importe total de impuestos (IVA/IGIC, opcional).'),
  taxRate: z.number().optional().describe('El tipo de impuesto aplicado (ej. 21 para 21%, opcional).'),
  totalAmount: z.number().describe('El importe total a pagar.'),
  currency: z.string().describe('La moneda de la factura (ej. EUR, USD).'),
  lineItems: z
    .array(
      z.object({
        description: z.string().describe('Descripción del concepto o producto.'),
        quantity: z.number().describe('Cantidad.'),
        unitPrice: z.number().describe('Precio unitario.'),
        amount: z.number().describe('Importe total del concepto (cantidad * precio unitario).'),
      })
    )
    .describe('Lista de los conceptos/líneas de la factura.'),
});
export type ExtractInvoiceDataOutput = z.infer<typeof ExtractInvoiceDataOutputSchema>;

export async function extractInvoiceData(input: ExtractInvoiceDataInput): Promise<ExtractInvoiceDataOutput> {
  return extractInvoiceDataFlow(input);
}

// --- PROMPT (Instrucciones en español, petición de JSON) ---
const extractInvoiceDataPrompt = ai.definePrompt({
  name: 'extractInvoiceDataPrompt',
  input: { schema: ExtractInvoiceDataInputSchema },
  output: { schema: ExtractInvoiceDataOutputSchema },
  prompt: `Eres un asistente experto de IA especializado en extraer datos estructurados de facturas españolas.

Recibirás una imagen de una factura. Tu tarea es extraer toda la información relevante. Sé lo más detallado posible.

-   **invoiceNumber**: El número identificativo único de la factura.
-   **invoiceDate**: La fecha de emisión. Devuelve en formato AAAA-MM-DD.
-   **dueDate**: La fecha de vencimiento del pago. Devuelve en formato AAAA-MM-DD.
-   **supplierName**: El nombre de la empresa que emite la factura.
-   **clientName**: El nombre de la persona o empresa que recibe la factura.
-   **clientAddress**: La dirección completa del cliente.
-   **clientCif**: El NIF o CIF del cliente.
-   **subtotal**: El importe total antes de impuestos (base imponible). Si no está explícito, calcúlalo desde las líneas.
-   **taxAmount**: El importe total de impuestos (IVA/IGIC).
-   **taxRate**: El porcentaje de impuesto aplicado (ej., si es 21% IVA, devuelve 21).
-   **totalAmount**: El importe final a pagar.
-   **currency**: El símbolo o código de la moneda (ej., EUR, €).
-   **lineItems**: Una lista de todos los productos o servicios, incluyendo 'description', 'quantity', 'unitPrice', y 'amount'.

Aquí está la imagen de la factura: {{media url=invoiceDataUri}}

Extrae todos los datos y responde ÚNICAMENTE con el formato JSON requerido.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO ---
const extractInvoiceDataFlow = ai.defineFlow(
  {
    name: 'extractInvoiceDataFlow',
    inputSchema: ExtractInvoiceDataInputSchema,
    outputSchema: ExtractInvoiceDataOutputSchema,
  },
  async (input: ExtractInvoiceDataInput) => {
    try {
      // 1. Llamamos al prompt correcto y especificamos el modelo
      const { output } = await extractInvoiceDataPrompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'),
      });

      // 2. Validamos la salida con safeParse
      const parsed = ExtractInvoiceDataOutputSchema.safeParse(output);

      if (!parsed.success) {
        // Error en español
        console.error('Error de validación de Zod en extractInvoiceData:', parsed.error);
        throw new Error('La IA devolvió los datos de la factura en un formato inesperado.');
      }
      
      return parsed.data; // Devolvemos datos validados

    } catch (error) {
      // 3. Capturamos cualquier error y lo devolvemos en español
      console.error(`Error en extractInvoiceDataFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudieron extraer los datos de la factura. Error: ${message}`);
    }
  }
);
