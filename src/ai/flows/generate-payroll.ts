
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
    type GeneratePayrollInput,
    type GeneratePayrollOutput 
} from '@/ai/schemas/payroll-schemas'; // Asumimos schemas importados de aquí
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

// --- PROMPT (Ahora recibe datos calculados y se centra en explicar/formatear) ---

// Extendemos el schema de entrada del prompt para incluir los datos calculados
const GeneratePayrollPromptInputSchema = GeneratePayrollInputSchema.extend({
  calculatedData: z.object({
      salarioMensual: z.number(),
      prorrataPagasExtra: z.number(),
      totalConceptosAdicionales: z.number(),
      totalDevengado: z.number(),
      bccc: z.number(),
      bccp: z.number(),
      baseIrpf: z.number(),
      deduccionCC: z.number(),
      tipoDesempleo: z.number(),
      deduccionDesempleo: z.number(),
      deduccionFP: z.number(),
      tipoIrpfEstimado: z.number(),
      deduccionIrpf: z.number(),
      totalDeducciones: z.number(),
      liquidoAPercibir: z.number(),
      antiguedad: z.string(),
      periodoLiquidacionDetallado: z.string(),
  }).describe("Objeto que contiene todos los importes ya calculados por el sistema.")
});

const prompt = ai.definePrompt({
  name: 'generatePayrollPrompt',
  input: { schema: GeneratePayrollPromptInputSchema }, // Usamos el schema extendido
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
- Salario Mensual Base: {{{calculatedData.salarioMensual}}}
- Prorrata Pagas Extra: {{{calculatedData.prorrataPagasExtra}}}
- Total Conceptos Adicionales: {{{calculatedData.totalConceptosAdicionales}}}
- **Total Devengado:** {{{calculatedData.totalDevengado}}}
- BCCC: {{{calculatedData.bccc}}}
- BCCP: {{{calculatedData.bccp}}}
- Base IRPF: {{{calculatedData.baseIrpf}}}
- Deducción Contingencias Comunes: {{{calculatedData.deduccionCC}}} (Calculado como ${TIPO_CONTINGENCIAS_COMUNES*100}% de BCCC)
- Deducción Desempleo: {{{calculatedData.deduccionDesempleo}}} (Calculado como {{{calculatedData.tipoDesempleo}}}% de BCCP)
- Deducción Formación Profesional: {{{calculatedData.deduccionFP}}} (Calculado como ${TIPO_FORMACION_PROFESIONAL*100}% de BCCP)
- Deducción IRPF: {{{calculatedData.deduccionIrpf}}} (Estimado como {{{calculatedData.tipoIrpfEstimado}}}% de Base IRPF)
- **Total Deducciones:** {{{calculatedData.totalDeducciones}}}
- **Líquido a Percibir:** {{{calculatedData.liquidoAPercibir}}}
- Antigüedad: {{{calculatedData.antiguedad}}}
- Periodo Liquidación Detallado: {{{calculatedData.periodoLiquidacionDetallado}}}


**Tu Tarea:**
Rellena la estructura JSON de salida (\`GeneratePayrollOutputSchema\`) utilizando los datos y cálculos proporcionados.
- En \`header\`, completa TODOS los campos, incluyendo los de la empresa y el empleado. Usa los datos proporcionados.
- En \`accruals.items\`, incluye el Salario Base, la Prorrata y los Conceptos Adicionales.
- En \`deductions.items\`, incluye las Contingencias Comunes, Desempleo, Formación Profesional e IRPF.
Asegúrate de que todos los importes coinciden exactamente con los valores de 'CÁLCULOS REALIZADOS'. Sé preciso y claro. Responde ÚNICAMENTE con el JSON.`,
});

// --- FLUJO CORREGIDO Y ROBUSTO (CON CÁLCULOS EXTERNALIZADOS) ---
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
        const salarioMensual = input.grossAnnualSalary / 12; // Asumimos 12 pagas
        const prorrataPagasExtra = 0; // Simplificación: Asumimos 12 pagas, no hay prorrata.
        const totalConceptosAdicionales = input.additionalConcepts?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
        const totalDevengado = salarioMensual + prorrataPagasExtra + totalConceptosAdicionales;

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
        const periodoLiquidacionDetallado = `Del ${format(startDate, 'dd/MM/yyyy')} al ${format(endDate, 'dd/MM/yyyy')}`;


        calculatedData = {
          salarioMensual,
          prorrataPagasExtra,
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
        };

    } catch (calcError) {
        console.error("Error durante el cálculo de la nómina:", calcError);
        throw new Error("Hubo un error al calcular los importes. Verifica los datos de entrada del empleado.");
    }

    // --- PASO 2: LLAMADA A LA IA (SOLO PARA FORMATEAR JSON) ---
    try {
      const { output } = await prompt({ ...input, calculatedData }, {
        model: googleAI.model('gemini-2.5-flash-lite'),
      });

      const parsed = GeneratePayrollOutputSchema.safeParse(output);
      if (!parsed.success) {
        console.error('Error de Zod en generatePayroll:', parsed.error);
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
