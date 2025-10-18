
'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-powered website management, allowing users to generate a complete and personalized website template.
 *
 * - aiPoweredWebManagement - A function that handles the website generation process.
 * - AIPoweredWebManagementInput - The input type for the function.
 * - AIPoweredWebManagementOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const AIPoweredWebManagementInputSchema = z.object({
  businessDescription: z
    .string()
    .describe('A detailed description of the user’s business, including its products, services, and target audience.'),
  websiteType: z
    .enum(['website', 'online store', 'landing page'])
    .describe('The type of website the user wants to create.'),
  designPreferences: z
    .string()
    .describe('The user’s preferences for the website design, including color schemes, layout, and desired aesthetics.'),
  exampleWebsites: z
    .string()
    .describe('Optional: URLs of example websites that the user likes, to guide the AI in generating a suitable design.'),
  additionalFeatures: z
    .string()
    .describe('Any specific features the user wants to include in the website, such as a blog, contact form, or e-commerce functionality.'),
});

export type AIPoweredWebManagementInput = z.infer<typeof AIPoweredWebManagementInputSchema>;

const AIPoweredWebManagementOutputSchema = z.object({
  siteTitle: z.string().describe('The main title for the website, to be used in the browser tab.'),
  hero: z.object({
    title: z.string().describe('A catchy and engaging headline for the hero section.'),
    subtitle: z.string().describe('A brief, compelling subtitle that expands on the headline.'),
    ctaButtonText: z.string().describe('The call-to-action text for the main button (e.g., "Learn More", "Get Started").'),
    imagePrompt: z.string().describe('A descriptive prompt for an AI image generator to create a relevant hero background image (e.g., "professional working on a laptop in a modern office").'),
  }).describe('The main hero section of the website.'),
  about: z.object({
    title: z.string().describe('The title for the "About Us" section (e.g., "Sobre Nosotros").'),
    paragraph1: z.string().describe('The first paragraph of the about section, introducing the company or professional.'),
    paragraph2: z.string().describe('The second paragraph, detailing the mission, vision, or values.'),
    imagePrompt: z.string().describe('A prompt for an image representing the business or team (e.g., "friendly team collaborating in an office").'),
  }).describe('The section that describes the business.'),
  services: z.array(
    z.object({
      title: z.string().describe('The title of the service or feature.'),
      description: z.string().describe('A short description of the service or feature.'),
      icon: z.string().describe('A keyword for a relevant icon from lucide-react (e.g., "PenTool", "BarChart", "ShieldCheck").'),
    })
  ).describe('A list of 3-6 key services or features offered.'),
  testimonials: z.array(
    z.object({
      quote: z.string().describe('A compelling fictional quote from a satisfied customer.'),
      author: z.string().describe('The name of the fictional customer.'),
      company: z.string().describe('The company of the fictional customer.'),
    })
  ).describe('A list of 2-3 fictional testimonials to build trust.'),
  contact: z.object({
    title: z.string().describe('The title for the contact section (e.g., "Contacta con Nosotros").'),
    description: z.string().describe('A short text encouraging users to get in touch.'),
    formFields: z.array(z.string()).describe('A list of fields for the contact form (e.g., "Nombre", "Email", "Mensaje").'),
    buttonText: z.string().describe('The text for the contact form submission button (e.g., "Enviar Mensaje").'),
  }).describe('The contact section.'),
});

export type AIPoweredWebManagementOutput = z.infer<typeof AIPoweredWebManagementOutputSchema>;

export async function aiPoweredWebManagement(input: AIPoweredWebManagementInput): Promise<AIPoweredWebManagementOutput> {
  return aiPoweredWebManagementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredWebManagementPrompt',
  input: {schema: AIPoweredWebManagementInputSchema},
  output: {schema: AIPoweredWebManagementOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are an expert web developer and copywriter. Your task is to generate a complete, personalized website template structure based on the user's business information. Generate compelling and professional content for each section.

Business Information:
- Business Description: {{{businessDescription}}}
- Website Type: {{{websiteType}}}
- Design Preferences: {{{designPreferences}}}
- Example Websites: {{{exampleWebsites}}}
- Additional Features: {{{additionalFeatures}}}

Based on this, create a full website structure. Be creative and professional. Ensure the content is tailored to the business description provided. For icon keywords, suggest valid icon names from the 'lucide-react' library.
`,
});

const aiPoweredWebManagementFlow = ai.defineFlow(
  {
    name: 'aiPoweredWebManagementFlow',
    inputSchema: AIPoweredWebManagementInputSchema,
    outputSchema: AIPoweredWebManagementOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
