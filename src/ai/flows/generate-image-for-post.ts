
'use server';

/**
 * @fileOverview A Genkit flow to generate an image based on a text prompt.
 *
 * - generateImageForPost - A function that takes a text prompt and returns an AI-generated image.
 * - GenerateImageInput - The input type for the function.
 * - GenerateImageOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from. Should be descriptive and clear.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;


const GenerateImageOutputSchema = z.object({
    imageUrl: z.string().url().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImageForPost(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageForPostFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt: `Generate a visually appealing and high-quality image for a social media post with the following content: "${input.prompt}". The image should be eye-catching and relevant to the text.`,
    });
    
    if (!media.url) {
      throw new Error('Image generation failed.');
    }

    return { imageUrl: media.url };
  }
);
