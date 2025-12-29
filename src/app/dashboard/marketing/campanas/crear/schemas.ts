// This file is deprecated and will be removed. Please import from /src/ai/schemas/email-campaign-schemas.ts
import { z } from 'zod';

export const GenerateEmailCampaignInputSchema = z.object({
  campaignGoal: z.string().describe('The main objective of the email campaign (e.g., promote a new product, announce a sale, share news).'),
  targetAudience: z.string().describe('A description of the target audience for this email.'),
  tone: z.string().describe('The desired tone for the email (e.g., professional, friendly, urgent, informative).'),
  keyInfo: z.string().optional().describe('Any specific key information, offers, or links to include in the email.'),
});
export type GenerateEmailCampaignInput = z.infer<typeof GenerateEmailCampaignInputSchema>;

export const GenerateEmailCampaignOutputSchema = z.object({
    subject: z.string().describe('A compelling and concise subject line for the email.'),
    body: z.string().describe('The full body content of the email, written in plain text or simple markdown. It should be engaging and aligned with the campaign goal.'),
});
export type GenerateEmailCampaignOutput = z.infer<typeof GenerateEmailCampaignOutputSchema>;