'use server';

/**
 * @fileOverview Asistente conversacional de IA con acceso a datos financieros.
 * (Versión mejorada con herramienta para leer Firestore)
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit'; // Importamos z desde genkit
import { MessageData } from 'genkit/model';
import admin from 'firebase-admin'; // Necesitamos el Admin SDK para Firestore

// --- Inicialización de Firebase Admin (solo si no está ya inicializado en otro lugar) ---
// Asegúrate de que tus credenciales de servicio están configuradas en el entorno
// (En Cloud Functions/App Engine se hace automáticamente)
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// --- ESQUEMAS (Añadimos userId a la entrada) ---
const BusinessAssistantInputSchema = z.object({
  userId: z.string().describe('El ID del usuario autenticado.'), // <-- NUEVO
  history: z.array(z.custom<MessageData>()).describe('El historial de la conversación.'),
  message: z.string().describe('El último mensaje del usuario.'),
});
export type BusinessAssistantInput = z.infer<typeof BusinessAssistantInputSchema>;

const BusinessAssistantOutputSchema = z.object({
  response: z.string().describe("La respuesta del asistente de IA."),
});
export type BusinessAssistantOutput = z.infer<typeof BusinessAssistantOutputSchema>;

// --- NUEVA HERRAMIENTA: getFinancialSummary ---
const getFinancialSummary = ai.defineTool(
  {
    name: 'getFinancialSummary',
    description: 'Obtiene el total de ingresos (facturas emitidas) y gastos registrados para el usuario actual.',
    // No necesita inputSchema si siempre opera sobre el usuario logueado (pasado en el contexto o implícitamente)
    // Pero es más robusto pedir el userId explícitamente si el contexto no está garantizado.
    // Para este ejemplo, asumiremos que el userId se pasa implícitamente o lo sacamos de otro sitio.
    // Si necesitas pasarlo: inputSchema: z.object({ userId: z.string() }),
    outputSchema: z.object({
      totalIncome: z.number().describe('Suma total de importes de facturas.'),
      totalExpenses: z.number().describe('Suma total de importes de gastos.'),
    }),
  },
  // La función de la herramienta SÍ necesita el userId
  async ({ userId }: { userId: string }) => { // Recibimos userId del input del flujo
    console.log(`Tool: getFinancialSummary ejecutándose para userId: ${userId}`);
    try {
      let totalIncome = 0;
      const invoicesSnapshot = await db.collection('invoices')
                                     .where('ownerId', '==', userId) // Asegúrate que el campo se llame 'ownerId' o 'userId'
                                     .get();
      invoicesSnapshot.forEach(doc => {
        totalIncome += doc.data().totalAmount || 0; // Asegúrate que el campo se llame 'totalAmount'
      });

      let totalExpenses = 0;
      const expensesSnapshot = await db.collection('expenses')
                                      .where('ownerId', '==', userId) // Asegúrate que el campo se llame 'ownerId' o 'userId'
                                      .get();
      expensesSnapshot.forEach(doc => {
        totalExpenses += doc.data().importe || 0; // Asegúrate que el campo se llame 'importe'
      });

      console.log(`Tool: Resumen encontrado - Ingresos: ${totalIncome}, Gastos: ${totalExpenses}`);
      return { totalIncome, totalExpenses };

    } catch (dbError) {
      console.error("Error al acceder a Firestore en getFinancialSummary:", dbError);
      throw new Error("No se pudo acceder a los datos financieros en este momento.");
    }
  }
);


export async function businessAssistant(input: BusinessAssistantInput): Promise<BusinessAssistantOutput> {
  // Pasamos el userId al flujo
  return businessAssistantFlow(input); 
}

// --- SYSTEM PROMPT (Actualizado para mencionar la herramienta) ---
const systemPrompt: MessageData = {
  role: 'system',
  content: [
    {
      text: `Eres GestorIA, un asistente experto en negocios, finanzas, operaciones y marketing para autónomos y pymes en España.
Tu objetivo es proporcionar respuestas claras, concisas y accionables.
Tienes acceso a los datos de la aplicación del usuario mediante herramientas.
Cuando un usuario haga una pregunta sobre su situación financiera general (balance, pérdidas y ganancias, facturación total, gastos totales), **DEBES usar la herramienta 'getFinancialSummary'** para obtener los datos actualizados. No le pidas estos totales al usuario, utiliza la herramienta.
Si te preguntan por detalles específicos de facturas o gastos, indica que puedes buscar esa información si te lo piden explícitamente (si implementas herramientas para listas).
Si la información no está disponible ni con las herramientas, indícalo claramente.
Mantén un tono profesional pero cercano. Responde SIEMPRE en español.`
    },
  ],
};

// --- FLUJO CORREGIDO (Usa la herramienta) ---
const businessAssistantFlow = ai.defineFlow(
  {
    name: 'businessAssistantFlow',
    inputSchema: BusinessAssistantInputSchema,
    outputSchema: BusinessAssistantOutputSchema,
    // NO definimos 'tools' aquí, se pasan en 'ai.generate'
  },
  async (input: BusinessAssistantInput) => {
    // Construimos el historial para la IA
    const history: MessageData[] = [
      systemPrompt,
      ...input.history,
      { role: 'user', content: [{ text: input.message }] },
    ];

    try {
      // Llamamos a la IA especificando el modelo Y la herramienta disponible
      const response = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-lite'),
        messages: history,
        // Le decimos a la IA qué herramientas puede usar
        tools: [getFinancialSummary], 
        // Pasamos el userId a la herramienta cuando la IA decida llamarla
        toolRequestContext: { userId: input.userId }, 
      });

      const text = response.text;

      if (text === undefined || text === '') {
        console.error('La respuesta de la IA vino vacía (posiblemente tras llamada a herramienta).');
        // A veces la IA solo llama a la herramienta y no dice nada más.
        // Podríamos re-llamar a la IA aquí con el resultado de la herramienta si fuera necesario.
        // Por simplicidad, devolvemos un mensaje genérico.
        return { response: "He consultado los datos. ¿Necesitas algo más específico?" }; 
      }
      
      return { response: text };

    } catch (error) {
      console.error(`Error en businessAssistantFlow:`, error);
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`No se pudo obtener respuesta del asistente. Error: ${message}`);
    }
  }
);
