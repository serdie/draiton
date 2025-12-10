
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// Helper function to get user ID from subscription
async function getUserIdFromSubscription(subscriptionId: string) {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        return subscription.metadata.userId;
    } catch (error) {
        console.error("Error retrieving subscription from Stripe:", error);
        return null;
    }
}


export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️  Error de firma de Webhook:`, err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const planId = subscription.items.data[0].price.id;

        if (userId) {
          const userDocRef = doc(db, 'users', userId);
          let newRole: 'pro' | 'empresa' | 'free' = 'free';

          if (planId === process.env.NEXT_PUBLIC_STRIPE_PRO_MENSUAL || planId === process.env.NEXT_PUBLIC_STRIPE_PRO_ANUAL) {
            newRole = 'pro';
          } else if (planId === process.env.NEXT_PUBLIC_STRIPE_EMPRESA_MENSUAL || planId === process.env.NEXT_PUBLIC_STRIPE_EMPRESA_ANUAL) {
            newRole = 'empresa';
          }
          
          await updateDoc(userDocRef, { role: newRole });
          console.log(`✅ PAGO COMPLETADO: Usuario ${userId} actualizado al rol ${newRole}.`);
        }
        break;
      }
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.status === 'canceled' || subscription.cancel_at_period_end) {
          const userId = await getUserIdFromSubscription(subscription.id);
          if (userId) {
              const userDocRef = doc(db, 'users', userId);
              await updateDoc(userDocRef, { role: 'free' });
              console.log(`❌ BAJA: Usuario ${userId} ha sido degradado a rol 'free'.`);
          }
        }
        break;
      }

      default:
        // console.log(`Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error manejando el webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}
