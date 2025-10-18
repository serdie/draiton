
'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting invoice data from an image.
 *
 * - extractInvoiceData - A function that accepts an image of an invoice and returns the extracted data.
 * - ExtractInvoiceDataInput - The input type for the extractInvoiceData function.
 * - ExtractInvoiceDataOutput - The return type for the extractInvoiceData function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const ExtractInvoiceDataInputSchema = z.object({
  invoiceDataUri: z
    .string()
    .describe(
      "A photo or document of an invoice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ExtractInvoiceDataInput = z.infer<typeof ExtractInvoiceDataInputSchema>;

const ExtractInvoiceDataOutputSchema = z.object({
  invoiceNumber: z.string().describe('The invoice number.'),
  invoiceDate: z.string().describe('The date of the invoice in YYYY-MM-DD format.'),
  dueDate: z.string().optional().describe('The due date of the invoice in YYYY-MM-DD format.'),
  supplierName: z.string().describe('The name of the supplier.'),
  clientName: z.string().describe('The name of the client.'),
  clientAddress: z.string().optional().describe('The full address of the client.'),
  clientCif: z.string().optional().describe('The CIF/NIF/Tax ID of the client.'),
  subtotal: z.number().optional().describe('The subtotal amount before taxes.'),
  taxAmount: z.number().optional().describe('The total tax amount.'),
  taxRate: z.number().optional().describe('The tax rate applied (e.g., 21 for 21%).'),
  totalAmount: z.number().describe('The total amount due on the invoice.'),
  currency: z.string().describe('The currency of the invoice (e.g., EUR, USD).'),
  lineItems: z
    .array(
      z.object({
        description: z.string().describe('Description of the item.'),
        quantity: z.number().describe('Quantity of the item.'),
        unitPrice: z.number().describe('Unit price of the item.'),
        amount: z.number().describe('Total amount for the item (quantity * unitPrice).'),
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
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an expert AI assistant specialized in extracting structured data from invoices.

You will receive an image of an invoice. Your task is to extract all the relevant information to fill out a form. Be as detailed as possible.

- Invoice Number: The unique identifier for the invoice.
- Invoice Date: The date the invoice was issued. Return in YYYY-MM-DD format.
- Due Date: The date the payment is due. Return in YYYY-MM-DD format.
- Supplier Name: The name of the company issuing the invoice.
- Client Name: The name of the person or company receiving the invoice.
- Client Address: The full address of the client.
- Client CIF/NIF: The tax identification number of the client.
- Subtotal: The total amount before taxes. If not present, calculate from line items.
- Tax Amount: The total amount of taxes.
- Tax Rate: The percentage of tax applied (e.g., if 21% VAT, return 21).
- Total Amount: The final amount to be paid.
- Currency: The currency symbol or code (e.g., EUR, €).
- Line Items: A list of all products or services, including their description, quantity, unit price, and total amount.

Here is the invoice image: {{media url=invoiceDataUri}}

Extract all the data and respond in the required JSON format.`,
});

const extractInvoiceDataFlow = ai.defineFlow(
  {
    name: 'extractInvoiceDataFlow',
    inputSchema: ExtractInvoiceDataInputSchema,
    outputSchema: ExtractInvoiceDataOutputSchema,
  },
  async (input) => {
    const { output } = await extractInvoiceDataPrompt(input);
    return output!;
  }
);
