'use server';

/**
 * @fileOverview Flujo de Genkit para generar una nómina española detallada.
 * (Versión final con cálculos externalizados, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import { 
    GeneratePayrollInputSchema, 
    GeneratePayrollOutputSchema,
    type GeneratePayrollInput, // 1. Importa los tipos que ESTE archivo necesita
    type GeneratePayrollOutput 
} from '@/ai/schemas/payroll-schemas'; 
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// 2. Re-exporta los tipos para que 'actions.ts' pueda encontrarlos
export type { GeneratePayrollInput, GeneratePayrollOutput } from '@/ai/schemas/payroll-schemas';

// --- CONSTANTES DE COTIZACIÓN Y RETENCIÓN (¡IMPORTANTE! Actualizar según legislación vigente) ---
const TIPO_CONTINGENCIAS_COMUNES = 0.0480; // Aprox. 4.80% (verificar BOE para el año actual)
const TIPO_DESEMPLEO_INDEFINIDO = 0.0155; // 1.55%
const TIPO_DESEMPLEO_TEMPORAL = 0.0160; // 1.60%
const TIPO_FORMACION_PROFESIONAL = 0.0010; // 0.10%
// Estimación MUY SIMPLIFICADA de IRPF. Una app real necesita un cálculo mucho más preciso (tramos, situación familiar, etc.)
const TIPO_IRPF_ESTIMADO = 0.18; // 18% (Ejemplo, ¡NO USAR EN PRODUCCIÓN SIN CÁLCULO REALISTA!)

export async function generatePayroll(input: GeneratePayrollInput): Promise<GeneratePayrollOutput> {
  return generatePayrollFlow(input);
}


const GeneratePayrollPromptInputSchema = GeneratePayrollInputSchema.extend({
  calculatedData: z.string().describe("Objeto JSON como string que contiene todos los importes ya calculados por el sistema.")
});

const prompt = ai.definePrompt({
  name: 'generatePayrollPrompt',
  input: { schema: GeneratePayrollPromptInputSchema }, 
  output: { schema: GeneratePayrollOutputSchema },
  prompt: `Eres un experto asesor laboral en España. Tu tarea es generar una nómina detallada en formato JSON, utilizando los datos de la empresa, del empleado y los cálculos YA REALIZADOS que se te proporcionan.

**Datos de la Empresa:**
- Nombre: {{{companyName}}}
- CIF: {{{cif}}}
- Dirección: {{{companyAddress}}}
- Código Cuenta Cotización: {{{contributionAccountCode}}}

**Datos del Empleado:**
- Nombre: {{{employeeName}}}
- NIF: {{{nif}}}
- Nº Afiliación S.S.: {{{socialSecurityNumber}}}
- Grupo Profesional: {{{professionalGroup}}}
- Puesto/Categoría: {{{position}}}
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

**CÁLCULOS REALIZADOS (Usa estos valores EXACTOS para rellenar la salida):**
\`\`\`json
{{{calculatedData}}}
\`\`\`

**Tu Tarea:**
1.  Rellena la estructura JSON de salida (\`GeneratePayrollOutputSchema\`).
2.  En \`header\`, completa TODOS los campos usando los datos proporcionados.
3.  En \`accruals.items\`, crea una línea para cada devengo: Salario Base, Prorrata Pagas Extra (si aplica), y los conceptos adicionales.
    - Para "Salario Base", usa el código '001', la cuantía de '30.00' días y el precio/día calculado para que el total coincida con 'salarioBaseMensual'.
    - Para "Prorrata Pagas Extra", si aplica, usa el código '002', la cuantía '2.00' (dos pagas) y el precio correspondiente al valor de la prorrata mensual.
4. En \`deductions.items\`, crea una línea para cada deducción: Contingencias Comunes, Desempleo, Formación Profesional e IRPF. Usa los importes calculados. Para el IRPF, indica el tipo de retención.
5.  Calcula los totales de devengos y deducciones en los campos \`total\` de cada sección.
6.  Asegúrate de que el \`netPay\` coincide con el calculado.
7.  Completa la sección de bases de cotización.

Sé preciso y profesional. Responde ÚNICAMENTE con el JSON.`,
});


const generatePayrollFlow = ai.defineFlow(
  {
    name: 'generatePayrollFlow',
    inputSchema: GeneratePayrollInputSchema,
    outputSchema: GeneratePayrollOutputSchema,
  },
  async (input: GeneratePayrollInput) => {
    
    // --- PASO 1: CÁLCULOS EN TYPESCRIPT ---
    let calculatedData: any = {};
    try {
        const salarioAnual = input.grossAnnualSalary;
        const salarioBaseMensual = salarioAnual / 14;

        const prorrataPagasExtraMensual = input.proratedExtraPays ? (salarioBaseMensual * 2) / 12 : 0;
        
        const totalConceptosAdicionales = input.additionalConcepts?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
        const totalDevengado = salarioBaseMensual + prorrataPagasExtraMensual + totalConceptosAdicionales;

        const bccc = totalDevengado;
        const bccp = totalDevengado;
        const baseIrpf = totalDevengado;

        const deduccionCC = bccc * TIPO_CONTINGENCIAS_COMUNES;
        const tipoDesempleo = input.contractType === 'Indefinido' ? TIPO_DESEMPLEO_INDEFINIDO : TIPO_DESEMPLEO_TEMPORAL;
        const deduccionDesempleo = bccp * tipoDesempleo;
        const deduccionFP = bccp * TIPO_FORMACION_PROFESIONAL;
        const deduccionIrpf = baseIrpf * TIPO_IRPF_ESTIMADO; 
        
        const totalDeducciones = deduccionCC + deduccionDesempleo + deduccionFP + deduccionIrpf;
        const liquidoAPercibir = totalDevengado - totalDeducciones;

        const antiguedad = input.hireDate ? format(new Date(input.hireDate), "dd MMM yyyy", { locale: es }) : 'N/A';
        
        const [monthName, year] = input.paymentPeriod.split(' ');
        const monthIndex = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].indexOf(monthName);
        const startDate = new Date(parseInt(year), monthIndex, 1);
        const endDate = new Date(parseInt(year), monthIndex + 1, 0);
        
        const totalDays = 30; // Siempre 30 días para nómina mensual
        const periodoLiquidacionDetallado = `Del ${format(startDate, 'dd/MM/yyyy')} al ${format(endDate, 'dd/MM/yyyy')} (${totalDays} días)`;


        calculatedData = {
          salarioBaseMensual,
          salarioDiario: salarioBaseMensual / 30,
          prorrataPagasExtraMensual,
          totalConceptosAdicionales,
          totalDevengado,
          bccc,
          bccp,
          baseIrpf,
          deduccionCC,
          tipoDesempleo: tipoDesempleo * 100,
          deduccionDesempleo,
          deduccionFP,
          tipoIrpfEstimado: TIPO_IRPF_ESTIMADO * 100,
          deduccionIrpf,
          totalDeducciones,
          liquidoAPercibir,
          antiguedad,
          periodoLiquidacionDetallado,
          totalDays,
        };

    } catch (calcError) {
        console.error("Error durante el cálculo de la nómina:", calcError);
        throw new Error("Hubo un error al calcular los importes. Verifica los datos de entrada del empleado.");
    }

    // --- PASO 2: LLAMADA A LA IA (SOLO PARA FORMATEAR JSON) ---
    try {
      const promptInput = {
        ...input,
        calculatedData: JSON.stringify(calculatedData, null, 2)
      };

      const { output } = await prompt(promptInput, {
        model: googleAI.model('gemini-2.5-flash-lite'),
      });

      const parsed = GeneratePayrollOutputSchema.safeParse(output);
      if (!parsed.success) {
        console.error('Error de Zod en generatePayroll:', parsed.error.flatten());
        throw new Error('La IA ha devuelto una nómina con formato inesperado.');
      }
      return parsed.data;

    } catch (error) {
      console.error(`Error en generatePayrollFlow (llamada IA):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudo generar la nómina. Error: ${message}`);
    }
  }
);