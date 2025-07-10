'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting expense data from a receipt image.
 *
 * - extractReceiptData - A function that accepts an image of a receipt and returns the extracted data.
 * - ExtractReceiptDataInput - The input type for the extractReceiptData function.
 * - ExtractReceiptDataOutput - The return type for the extractReceiptData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractReceiptDataInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractReceiptDataInput = z.infer<typeof ExtractReceiptDataInputSchema>;

const ExtractReceiptDataOutputSchema = z.object({
  supplier: z.string().describe('The name of the supplier or store.'),
  date: z.string().describe('The date of the expense in YYYY-MM-DD format.'),
  totalAmount: z.number().describe('The total amount of the expense.'),
  taxAmount: z.number().optional().describe('The tax amount (e.g., IVA, VAT) if available.'),
  category: z
    .enum(['Software', 'Oficina', 'Marketing', 'Viajes', 'Suministros', 'Otros'])
    .describe('A suggested category for the expense.'),
  description: z
    .string()
    .describe('A brief description of the items purchased.'),
});
export type ExtractReceiptDataOutput = z.infer<typeof ExtractReceiptDataOutputSchema>;

export async function extractReceiptData(input: ExtractReceiptDataInput): Promise<ExtractReceiptDataOutput> {
  return extractReceiptDataFlow(input);
}

const extractReceiptDataPrompt = ai.definePrompt({
  name: 'extractReceiptDataPrompt',
  input: {schema: ExtractReceiptDataInputSchema},
  output: {schema: ExtractReceiptDataOutputSchema},
  prompt: `You are an expert AI assistant specialized in extracting data from receipts and tickets.

You will receive an image of a receipt. Your task is to extract the following information:
- Supplier Name: The name of the store or provider.
- Date: The date of the transaction. Provide it in YYYY-MM-DD format.
- Total Amount: The final total amount paid.
- Tax Amount: The value of the taxes (like IVA or VAT). If not explicitly found, you can leave it empty.
- Category: Infer a relevant category from the following options: Software, Oficina, Marketing, Viajes, Suministros, Otros.
- Description: Create a short summary of the items or services purchased.

Here is the receipt image: {{media url=receiptDataUri}}

Extract the data and respond in the required JSON format.`,
});

const extractReceiptDataFlow = ai.defineFlow(
  {
    name: 'extractReceiptDataFlow',
    inputSchema: ExtractReceiptDataInputSchema,
    outputSchema: ExtractReceiptDataOutputSchema,
  },
  async input => {
    const {output} = await extractReceiptDataPrompt(input);
    return output!;
  }
);
