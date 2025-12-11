import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin'; // <--- Importamos el Admin
import { FieldValue } from 'firebase-admin/firestore'; // Tipos de Admin

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-11-17.clover', // Asegúrate que coincida con tu versión
  typescript: true,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) throw new Error('Falta firma o secreto');
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️ Error de firma Webhook:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    // 1. PAGO EXITOSO: Dar rol PRO ✅
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.userId;
      const targetRole = session.metadata?.targetRole || 'pro';

      if (userId) {
        console.log(`✅ [ADMIN] Pago recibido de ${userId}. Asignando rol: ${targetRole}`);
        
        // Usamos adminDb para escribir SIN restricciones de seguridad
        await adminDb.collection('users').doc(userId).update({
            role: targetRole,
            planPending: null,
            subscriptionStatus: 'active',
            updatedAt: FieldValue.serverTimestamp(),
            stripeSubscriptionId: session.subscription, // Guardamos ID suscripción
            stripeCustomerId: session.customer as string,
        });
      }
    }

    // 2. CANCELACIÓN: Quitar rol PRO 👋
    if (event.type === 'customer.subscription.deleted') {
       const subscription = event.data.object as Stripe.Subscription;
       console.log(`❌ [ADMIN] Suscripción cancelada: ${subscription.id}`);
       
       // Buscamos al usuario por su ID de suscripción
       const snapshot = await adminDb.collection('users')
         .where('stripeSubscriptionId', '==', subscription.id)
         .limit(1)
         .get();

       if (!snapshot.empty) {
         const userDoc = snapshot.docs[0];
         await userDoc.ref.update({
           role: 'free',
           subscriptionStatus: 'canceled',
           updatedAt: FieldValue.serverTimestamp()
         });
         console.log(`Usuario ${userDoc.id} degradado a FREE.`);
       }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}