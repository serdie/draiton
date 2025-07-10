// 'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting invoice data from an image.
 *
 * - extractInvoiceData - A function that accepts an image of an invoice and returns the extracted data.
 * - ExtractInvoiceDataInput - The input type for the extractInvoiceData function.
 * - ExtractInvoiceDataOutput - The return type for the extractInvoiceData function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractInvoiceDataInputSchema = z.object({
  invoiceDataUri: z
    .string()
    .describe(
      'A photo or document of an invoice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type ExtractInvoiceDataInput = z.infer<typeof ExtractInvoiceDataInputSchema>;

const ExtractInvoiceDataOutputSchema = z.object({
  invoiceNumber: z.string().describe('The invoice number.'),
  invoiceDate: z.string().describe('The date of the invoice.'),
  supplierName: z.string().describe('The name of the supplier.'),
  clientName: z.string().describe('The name of the client.'),
  totalAmount: z.number().describe('The total amount due on the invoice.'),
  currency: z.string().describe('The currency of the invoice.'),
  lineItems: z
    .array(
      z.object({
        description: z.string().describe('Description of the item.'),
        quantity: z.number().describe('Quantity of the item.'),
        unitPrice: z.number().describe('Unit price of the item.'),
        amount: z.number().describe('Total amount for the item.'),
      })
    )
    .describe('Line items of the invoice.'),
});
export type ExtractInvoiceDataOutput = z.infer<typeof ExtractInvoiceDataOutputSchema>;

export async function extractInvoiceData(input: ExtractInvoiceDataInput): Promise<ExtractInvoiceDataOutput> {
  return extractInvoiceDataFlow(input);
}

const extractInvoiceDataPrompt = ai.definePrompt({
  name: 'extractInvoiceDataPrompt',
  input: {schema: ExtractInvoiceDataInputSchema},
  output: {schema: ExtractInvoiceDataOutputSchema},
  prompt: `You are an expert AI assistant specialized in extracting data from invoices.

You will receive an image of an invoice and your task is to extract the following information:
- Invoice Number
- Invoice Date
- Supplier Name
- Client Name
- Total Amount
- Currency
- Line Items (description, quantity, unit price, amount)

Here is the invoice image: {{media url=invoiceDataUri}}

Extract the data and respond in JSON format.`,
});

const extractInvoiceDataFlow = ai.defineFlow(
  {
    name: 'extractInvoiceDataFlow',
    inputSchema: ExtractInvoiceDataInputSchema,
    outputSchema: ExtractInvoiceDataOutputSchema,
  },
  async input => {
    const {output} = await extractInvoiceDataPrompt(input);
    return output!;
  }
);
