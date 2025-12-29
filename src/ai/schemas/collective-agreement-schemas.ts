import { z } from 'zod';

export const FindCollectiveAgreementInputSchema = z.object({
  scope: z.enum(['nacional', 'autonomico', 'provincial']).describe('El ámbito geográfico del convenio.'),
  region: z.string().optional().describe('La comunidad autónoma (si el ámbito es autonómico).'),
  province: z.string().optional().describe('La provincia (si el ámbito es provincial).'),
  sectorKeyword: z.string().describe('Palabra clave principal del sector (ej. "Hostelería", "Construcción").'),
});
export type FindCollectiveAgreementInput = z.infer<typeof FindCollectiveAgreementInputSchema>;

export const FindCollectiveAgreementOutputSchema = z.object({
  agreements: z.array(z.object({
    title: z.string().describe('El título completo y oficial del convenio colectivo.'),
    publicationDate: z.string().describe('La fecha de publicación en el boletín oficial (formato AAAA-MM-DD).'),
    sourceLink: z.string().url().describe('El enlace directo al documento oficial (BOE, boletín autonómico, etc.).'),
  })).describe('Una lista de los convenios colectivos más relevantes encontrados.'),
});
export type FindCollectiveAgreementOutput = z.infer<typeof FindCollectiveAgreementOutputSchema>;
