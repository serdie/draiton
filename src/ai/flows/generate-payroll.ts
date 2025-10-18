
'use server';

/**
 * @fileOverview A Genkit flow to generate a Spanish payslip (nómina).
 *
 * - generatePayroll - A function that takes employee and company data and returns a structured payslip.
 */

import { ai } from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import { 
    GeneratePayrollInputSchema, 
    GeneratePayrollOutputSchema,
    type GeneratePayrollInput,
    type GeneratePayrollOutput
} from '@/ai/schemas/payroll-schemas';

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

**Conceptos Adicionales (Devengos):**
{{#if additionalConcepts}}
{{#each additionalConcepts}}
- Concepto: {{{this.concept}}}, Importe: {{{this.amount}}}
{{/each}}
{{else}}
- No hay conceptos adicionales.
{{/if}}


**Instrucciones:**
1.  **Calcula el salario mensual:** Divide el salario bruto anual entre 12. Asume 12 pagas a menos que se indique lo contrario.
2.  **Determina los Devengos:**
    -   Salario Base: El salario mensual principal.
    -   Prorrata Pagas Extra: Si el salario es en 14 pagas, calcula la prorrata mensual. Para este ejercicio, asume 12 pagas y ponlo a 0.
    -   Añade cualquier concepto adicional proporcionado. El total devengado debe incluir estos conceptos.
3.  **Calcula las Bases de Cotización:**
    -   Base de Cotización de Contingencias Comunes (BCCC): Salario mensual + prorrata de pagas extra + conceptos adicionales que coticen.
    -   Base de Cotización de Contingencias Profesionales (BCCP): Igual que la BCCC.
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
