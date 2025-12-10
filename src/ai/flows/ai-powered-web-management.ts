'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-powered website management, allowing users to generate a complete and personalized website template.
 * (Versión final corregida y robusta)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- ESQUEMAS (Sin cambios) ---

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

// --- PROMPT MEJORADO ---
const prompt = ai.definePrompt({
  name: 'aiPoweredWebManagementPrompt',
  input: { schema: AIPoweredWebManagementInputSchema },
  output: { schema: AIPoweredWebManagementOutputSchema },
  prompt: `Eres un director de arte y estratega de marketing de élite, especializado en la creación de sitios web de alto impacto para autónomos y pymes. Tu tarea es generar una estructura de sitio web completa y personalizada que no solo sea profesional, sino también visualmente atractiva y persuasiva.

**Información del Negocio:**
- Descripción del Negocio: {{{businessDescription}}}
- Tipo de Sitio Web: {{{websiteType}}}
- Preferencias de Diseño: {{{designPreferences}}}
- Sitios Web de Ejemplo: {{{exampleWebsites}}}
- Funcionalidades Adicionales: {{{additionalFeatures}}}

**Tus Instrucciones:**

1.  **Conceptualización de Alto Nivel:** Basado en la descripción, define una Propuesta de Valor Única (PVU) y un tono de comunicación que resuene con el público objetivo. Refleja esto en todo el contenido que generes.
2.  **Contenido de Calidad Profesional:** Crea textos (copywriting) que sean claros, concisos y orientados a la conversión. Cada palabra debe tener un propósito. Utiliza un lenguaje que inspire confianza y profesionalismo.
3.  **Hero Section Impactante:**
    *   **Título (`title`):** Debe ser magnético, captar la atención inmediatamente y comunicar el beneficio principal.
    *   **Subtítulo (`subtitle`):** Debe expandir el título, resolver una duda clave o presentar el problema que solucionas.
    *   **Prompt de Imagen (`imagePrompt`):** ¡Sé muy descriptivo! No te limites a "persona trabajando". Especifica el estilo (ej: "fotografía cinematográfica, luz natural, colores cálidos"), el ambiente (ej: "oficina moderna y minimalista"), la acción y la emoción. Ejemplo: "Fotografía de estudio profesional, un artesano sonríe mientras pule una pieza de madera, con herramientas desenfocadas en el fondo, luz cálida lateral".
4.  **Sección "Sobre Nosotros" Convincente:** No te limites a contar la historia. Comunica la misión, los valores y por qué el cliente debería confiar en este negocio.
5.  **Servicios Claros y Orientados a Beneficios:** Para cada servicio, describe no solo lo que es, sino el beneficio que aporta al cliente.
6.  **Iconos Válidos:** Para los iconos de los servicios, proporciona siempre un nombre de icono válido y relevante de la librería 'lucide-react'.

Genera una estructura web completa basada en estas directrices. Responde ÚNICAMENTE con la estructura JSON requerida.`,
});


// --- FLUJO CORREGIDO Y ROBUSTO ---
const aiPoweredWebManagementFlow = ai.defineFlow(
  {
    name: 'aiPoweredWebManagementFlow',
    inputSchema: AIPoweredWebManagementInputSchema,
    outputSchema: AIPoweredWebManagementOutputSchema,
  },
  async (input: AIPoweredWebManagementInput) => { // Añadimos tipo a input
    try {
      // 1. Llamamos al prompt especificando el modelo
      const { output } = await prompt(input, {
        model: googleAI.model('gemini-2.5-flash-lite'), // Modelo añadido aquí
      });

      // 2. Validamos la salida con safeParse
      const parsed = AIPoweredWebManagementOutputSchema.safeParse(output);

      if (!parsed.success) {
        console.error('Error de Zod en aiPoweredWebManagement:', parsed.error);
        throw new Error('La IA ha devuelto una estructura de web con formato inesperado.');
      }
      
      return parsed.data; // Devolvemos los datos validados

    } catch (error) {
      // 3. Capturamos cualquier error
      console.error(`Error en aiPoweredWebManagementFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudo generar la estructura web. Error: ${message}`);
    }
  }
);
