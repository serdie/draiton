'use server';

/**
 * @fileOverview Flujo de Genkit para asistir con la cumplimentación de modelos fiscales españoles.
 * (Versión final con cálculos externalizados, robusta y en español)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';

// --- CONSTANTES FISCALES (Actualizar según legislación vigente) ---
const TIPO_IVA_GENERAL = 0.21; // 21%
const TIPO_IRPF_PAGO_FRACCIONADO_ESTIMADO = 0.20; // 20% (Modelo 130 - Estimación Simplificada)

// --- ESQUEMAS (Descripciones en español) ---
const FiscalAssistantInputSchema = z.object({
  taxModel: z.enum(['Modelo 303 (IVA)', 'Modelo 130 (IRPF)', 'Modelo 111 (Retenciones)', 'Modelo 347 (Operaciones con terceros)']).describe('El modelo fiscal español específico con el que necesita ayuda.'),
  income: z.number().describe('Ingresos totales (base imponible) del periodo.'),
  expenses: z.number().describe('Gastos deducibles totales (base imponible) del periodo.'),
  notes: z.string().optional().describe('Notas adicionales o preguntas específicas del usuario.'),
});
export type FiscalAssistantInput = z.infer<typeof FiscalAssistantInputSchema>;

const FiscalAssistantOutputSchema = z.object({
  modelSummary: z.string().describe('Un breve resumen de para qué sirve este modelo fiscal.'),
  instructions: z.array(z.object({
    field: z.string().describe('El nombre o número de la casilla/campo del modelo.'),
    value: z.string().describe('El valor calculado o dato a introducir en la casilla.'),
    explanation: z.string().describe('Explicación clara de cómo se calcula el valor o qué representa.'),
  })).describe('Lista paso a paso con instrucciones para rellenar las casillas más importantes.'),
  finalResult: z.string().describe('El resultado final del modelo (ej. "A pagar", "A devolver", "A compensar", "Informativo").'),
  importantNotes: z.string().describe('Consideraciones clave, plazos o advertencias relacionadas con este modelo.'),
});
export type FiscalAssistantOutput = z.infer<typeof FiscalAssistantOutputSchema>;

export async function fiscalAssistant(input: FiscalAssistantInput): Promise<FiscalAssistantOutput> {
  return fiscalAssistantFlow(input);
}

// --- PROMPT (Ahora recibe datos calculados y se centra en explicar) ---

// Extendemos el schema de entrada del prompt para los datos calculados
const FiscalAssistantPromptInputSchema = FiscalAssistantInputSchema.extend({
  calculatedResults: z.any().describe('Objeto con los resultados de los cálculos fiscales ya realizados.')
});

const prompt = ai.definePrompt({
  name: 'fiscalAssistantPrompt',
  input: { schema: FiscalAssistantPromptInputSchema }, // Usamos schema extendido
  output: { schema: FiscalAssistantOutputSchema },
  prompt: `Eres un experto asesor fiscal en España. La tarea es generar una guía clara para rellenar un modelo fiscal, usando los datos del usuario y los CÁLCULOS YA REALIZADOS que se proporcionan.

**Datos del Usuario:**
- Modelo Fiscal: {{{taxModel}}}
- Ingresos (Base): {{{income}}}
- Gastos Deducibles (Base): {{{expenses}}}
- Notas Adicionales: {{{notes}}}

**CÁLCULOS REALIZADOS (Usa estos valores EXACTOS):**
\`\`\`json
{{{JSON.stringify calculatedResults}}}
\`\`\`

**Tu Tarea:**
1.  **Resumen del Modelo**: Explica brevemente para qué sirve el {{{taxModel}}}.
2.  **Instrucciones**: Basándote en los 'CÁLCULOS REALIZADOS', crea una guía paso a paso sencilla para las casillas clave. Indica el nombre/número de casilla, el valor a introducir (usando los datos calculados) y una explicación simple.
    -   *Ejemplo para Modelo 303:* "Casilla [28] (Resultado Régimen General): Introduce {{{calculatedResults.resultadoIva}}}. Es la diferencia entre el IVA cobrado ({{{calculatedResults.ivaRepercutido}}} €) y el IVA soportado ({{{calculatedResults.ivaSoportado}}} €), con un tipo general del {{{calculatedResults.tipoIva}}}."
    -   *Ejemplo para Modelo 130:* "Casilla [03] (Rendimiento Neto): Introduce {{{calculatedResults.rendimientoNeto}}}. Es tus ingresos menos tus gastos." "Casilla [13] (Resultado): Introduce {{{calculatedResults.pagoFraccionado}}}. Es el {{{calculatedResults.tipoIrpf}}} de tu rendimiento neto (mínimo 0)."
3.  **Resultado Final**: Indica claramente el resultado final usando el valor 'calculatedResults.finalResultText'.
4.  **Notas Importantes**: Añade consejos cruciales para el {{{taxModel}}} (plazos, errores comunes, etc.).

Responde ÚNICAMENTE en español y en el formato JSON requerido. Sé claro y didáctico.`,
});


// --- FLUJO CORREGIDO Y ROBUSTO (CON CÁLCULOS EXTERNALIZADOS) ---
const fiscalAssistantFlow = ai.defineFlow(
  {
    name: 'fiscalAssistantFlow',
    inputSchema: FiscalAssistantInputSchema,
    outputSchema: FiscalAssistantOutputSchema,
  },
  async (input: FiscalAssistantInput) => {

    // --- PASO 1: CÁLCULOS EN TYPESCRIPT ---
    let calculatedResults: any = { model: input.taxModel }; // Incluimos el modelo para referencia
    let finalResultText = "Modelo no soportado para cálculo automático o informativo.";

    try { // Envolvemos cálculos por si algo falla
        if (input.taxModel === 'Modelo 303 (IVA)') {
            const ivaRepercutido = input.income * TIPO_IVA_GENERAL;
            const ivaSoportado = input.expenses * TIPO_IVA_GENERAL;
            const resultadoIva = ivaRepercutido - ivaSoportado;
            finalResultText = resultadoIva >= 0 ? `A pagar: ${resultadoIva.toFixed(2)} €` : `A devolver/compensar: ${Math.abs(resultadoIva).toFixed(2)} €`;
            
            calculatedResults = {
                ...calculatedResults, // Mantenemos el modelo
                ivaRepercutido: ivaRepercutido.toFixed(2),
                ivaSoportado: ivaSoportado.toFixed(2),
                resultadoIva: resultadoIva.toFixed(2),
                tipoIva: (TIPO_IVA_GENERAL * 100).toFixed(0) + '%',
            };
        } else if (input.taxModel === 'Modelo 130 (IRPF)') {
            const rendimientoNeto = input.income - input.expenses;
            // Simplificación importante: Una app real necesita lógica más compleja (reducciones, etc.)
            const pagoFraccionado = Math.max(0, rendimientoNeto * TIPO_IRPF_PAGO_FRACCIONADO_ESTIMADO); 
            finalResultText = `A ingresar: ${pagoFraccionado.toFixed(2)} €`;

            calculatedResults = {
                ...calculatedResults, // Mantenemos el modelo
                rendimientoNeto: rendimientoNeto.toFixed(2),
                pagoFraccionado: pagoFraccionado.toFixed(2),
                tipoIrpf: (TIPO_IRPF_PAGO_FRACCIONADO_ESTIMADO * 100).toFixed(0) + '%',
            };
        } 
        // Lógica futura para Modelo 111 (basado en nóminas/facturas con retención)
        // Lógica futura para Modelo 347 (basado en operaciones > 3005.06€)
        else if (input.taxModel === 'Modelo 111 (Retenciones)' || input.taxModel === 'Modelo 347 (Operaciones con terceros)') {
             finalResultText = "Modelo principalmente informativo. Revisar documentación oficial para detalles.";
             // Podríamos añadir campos informativos si los tuviéramos
        }
    } catch(calcError) {
         console.error("Error durante el cálculo fiscal:", calcError);
         throw new Error("Hubo un error al calcular los importes. Verifica los datos de entrada.");
    }

    calculatedResults.finalResultText = finalResultText; // Añadimos el texto del resultado

    console.log("Datos calculados para IA:", calculatedResults);

    // --- PASO 2: LLAMADA A LA IA (SOLO PARA EXPLICAR Y FORMATEAR) ---
    try {
      const { output } = await prompt({ ...input, calculatedResults }, { // Pasamos input original + calculatedResults
        model: googleAI.model('gemini-2.5-flash-lite'),
      });

      // Aplicamos robustez con safeParse
      const parsed = FiscalAssistantOutputSchema.safeParse(output);
      if (!parsed.success) {
        console.error('Error de Zod en fiscalAssistant:', parsed.error);
        throw new Error('La IA ha devuelto instrucciones fiscales con formato inesperado.');
      }
      return parsed.data; // Devolvemos datos validados

    } catch (error) {
      // Capturamos cualquier error (API, red, etc.)
      console.error(`Error en fiscalAssistantFlow (llamada IA):`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudo generar la ayuda fiscal. Error: ${message}`);
    }
  }
);
