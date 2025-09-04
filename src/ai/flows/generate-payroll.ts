
'use server';

/**
 * @fileOverview A Genkit flow to generate a Spanish payslip (nómina).
 *
 * - generatePayroll - A function that takes employee and company data and returns a structured payslip.
 * - GeneratePayrollInput - The input type for the function.
 * - GeneratePayrollOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GeneratePayrollInputSchema = z.object({
  employeeName: z.string().describe('Full name of the employee.'),
  nif: z.string().describe('NIF/NIE of the employee.'),
  socialSecurityNumber: z.string().describe('Social Security affiliation number of the employee.'),
  contractType: z.string().describe('Type of contract (e.g., Indefinido, Temporal).'),
  professionalGroup: z.string().describe('Professional category or group.'),
  grossAnnualSalary: z.number().describe('The total gross annual salary of the employee.'),
  paymentPeriod: z.string().describe('The month and year for the payslip (e.g., "Julio 2024").'),
  companyName: z.string().describe('The legal name of the company.'),
  cif: z.string().describe('The CIF of the company.'),
  contributionAccountCode: z.string().describe('The company\'s Social Security Contribution Account Code (Código de Cuenta de Cotización).'),
});
export type GeneratePayrollInput = z.infer<typeof GeneratePayrollInputSchema>;

const PayrollItemSchema = z.object({
    concept: z.string().describe('The concept of the accrual or deduction (e.g., "Salario Base", "Contingencias Comunes").'),
    amount: z.number().describe('The monetary amount for this concept.'),
});

export const GeneratePayrollOutputSchema = z.object({
  header: z.object({
    companyName: z.string(),
    employeeName: z.string(),
    period: z.string(),
  }),
  accruals: z.object({
    items: z.array(PayrollItemSchema).describe('List of salary accruals (devengos).'),
    total: z.number().describe('Total accrued amount.'),
  }),
  deductions: z.object({
    items: z.array(PayrollItemSchema).describe('List of deductions to be made.'),
    total: z.number().describe('Total amount to be deducted.'),
  }),
  netPay: z.number().describe('The final net amount to be paid to the employee (Líquido a percibir).'),
  contributionBases: z.object({
    commonContingencies: z.number().describe('Contribution base for common contingencies.'),
    professionalContingencies: z.number().describe('Contribution base for professional contingencies (AT y EP).'),
    irpfWithholding: z.number().describe('Base for IRPF withholding.'),
    irpfPercentage: z.number().describe('The IRPF withholding percentage applied.'),
  }),
});
export type GeneratePayrollOutput = z.infer<typeof GeneratePayrollOutputSchema>;

export async function generatePayroll(input: GeneratePayrollInput): Promise<GeneratePayrollOutput> {
  return generatePayrollFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePayrollPrompt',
  input: { schema: GeneratePayrollInputSchema },
  output: { schema: GeneratePayrollOutputSchema },
  prompt: `Eres un experto asesor laboral en España. Tu tarea es generar una nómina detallada y precisa para un empleado basándote en la información proporcionada.

**Datos de la Empresa:**
- Nombre: {{{companyName}}}
- CIF: {{{cif}}}
- Código Cuenta Cotización: {{{contributionAccountCode}}}

**Datos del Empleado:**
- Nombre: {{{employeeName}}}
- NIF: {{{nif}}}
- Nº Afiliación S.S.: {{{socialSecurityNumber}}}
- Grupo Profesional: {{{professionalGroup}}}
- Tipo de Contrato: {{{contractType}}}
- Salario Bruto Anual: {{{grossAnnualSalary}}}

**Periodo de Liquidación:** {{{paymentPeriod}}}

**Instrucciones:**
1.  **Calcula el salario mensual:** Divide el salario bruto anual entre 12. Asume 12 pagas a menos que se indique lo contrario.
2.  **Determina los Devengos:**
    -   Salario Base: El salario mensual principal.
    -   Prorrata Pagas Extra: Si el salario es en 14 pagas, calcula la prorrata mensual. Para este ejercicio, asume 12 pagas y ponlo a 0.
3.  **Calcula las Bases de Cotización:**
    -   Base de Cotización de Contingencias Comunes (BCCC): Salario mensual + prorrata de pagas extra (si aplica).
    -   Base de Cotización de Contingencias Profesionales (BCCP): Igual que la BCCC, más horas extra (asume 0 si no se indica).
    -   Base de IRPF: Generalmente es el total devengado.
4.  **Calcula las Deducciones (Aportaciones del trabajador):**
    -   Contingencias Comunes: 4.80% de la BCCC (ajustado para 2024).
    -   Desempleo: 1.55% de la BCCP para contratos indefinidos, 1.60% para temporales.
    -   Formación Profesional: 0.10% de la BCCP.
    -   IRPF: Estima un porcentaje de retención razonable basado en el salario anual (ej. para 40,000€, un 18-20%). No necesitas ser exacto, pero sí coherente. Calcula el importe de la retención sobre la base de IRPF.
5.  **Calcula el Líquido a Percibir:** Total Devengado - Total Deducciones.

Organiza toda la información en la estructura JSON de salida requerida. Sé preciso y claro en los conceptos.`,
});

const generatePayrollFlow = ai.defineFlow(
  {
    name: 'generatePayrollFlow',
    inputSchema: GeneratePayrollInputSchema,
    outputSchema: GeneratePayrollOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
