import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover', // Tu versión de API
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// MAPA DE PRECIOS PARA DETECTAR ROL AUTOMÁTICAMENTE
// Asegúrate de que estos IDs coinciden con los de tu modo TEST de Stripe
const PRICE_ROLE_MAP: Record<string, string> = {
  'price_1SdamoDaJWPk1oF9vTeHa0g4': 'pro',      // Pro Mensual
  'price_1Sdam5DaJWPk1oF9IQyia1Ui': 'pro',      // Pro Anual
  'price_1SdanqDaJWPk1oF94oQKfJ4c': 'empresa',  // Empresa Mensual
  'price_1Sdan8DaJWPk1oF9fRGdppbU': 'empresa',  // Empresa Anual
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) throw new Error('Falta firma');
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Error Webhook:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    // -------------------------------------------------------
    // CASO 1: SE HA CREADO O ACTUALIZADO UNA SUSCRIPCIÓN
    // -------------------------------------------------------
    if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.updated') {
      
      let subscription: Stripe.Subscription;
      let userId = '';

      // A) Si viene del Checkout (Compra nueva)
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        userId = session.metadata?.userId || '';
        // Recuperamos la suscripción completa para tener las fechas
        subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      } 
      // B) Si viene del Portal (Cambio de plan)
      else {
        subscription = event.data.object as Stripe.Subscription;
        // Buscamos al usuario en Firebase usando el Customer ID de Stripe
        const snapshot = await adminDb.collection('users')
          .where('stripeCustomerId', '==', subscription.customer)
          .limit(1)
          .get();
        if (!snapshot.empty) userId = snapshot.docs[0].id;
      }

      if (userId) {
        // Extraemos datos clave
        // Usamos (subscription as any) para evitar errores de TypeScript si la versión difiere
        const subData = subscription as any;
        
        const priceItem = subData.items.data[0].price;
        const priceId = priceItem.id;
        const amount = priceItem.unit_amount ? priceItem.unit_amount / 100 : 0; 
        const interval = priceItem.recurring?.interval || 'month';
        const newRole = PRICE_ROLE_MAP[priceId] || 'pro'; 
        
        // CORRECCIÓN AQUÍ: Usamos subData para leer la fecha sin error rojo
        const endDate = Timestamp.fromMillis(subData.current_period_end * 1000);

        console.log(`🔄 Actualizando usuario ${userId}: Rol ${newRole}, Precio ${amount}€`);

        await adminDb.collection('users').doc(userId).update({
            role: newRole,
            planPrice: amount,          
            planInterval: interval,     
            currentPeriodEnd: endDate,  
            subscriptionStatus: subscription.status,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    // -------------------------------------------------------
    // CASO 2: CANCELACIÓN
    // -------------------------------------------------------
    if (event.type === 'customer.subscription.deleted') {
       const subscription = event.data.object as Stripe.Subscription;
       const snapshot = await adminDb.collection('users').where('stripeSubscriptionId', '==', subscription.id).limit(1).get();
       
       if (!snapshot.empty) {
         await snapshot.docs[0].ref.update({
           role: 'free',
           subscriptionStatus: 'canceled',
           planPrice: 0,
           currentPeriodEnd: null
         });
       }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error Webhook:', error);
    return NextResponse.json({ error: 'Fallo interno' }, { status: 500 });
  }
}