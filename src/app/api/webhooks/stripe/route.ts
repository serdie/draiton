import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe, PRICE_ROLE_MAP } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  let event: any;

  try {
    if (!signature || !webhookSecret) {
      throw new Error('Missing signature or webhook secret');
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('❌ Webhook signature error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // CASO 1: Checkout completado o suscripción actualizada
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'customer.subscription.updated'
    ) {
      let subscription: any;
      let userId = '';

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        userId = session.metadata?.userId || '';
        subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
      } else {
        subscription = event.data.object;
        const snapshot = await adminDb
          .collection('users')
          .where('stripeCustomerId', '==', subscription.customer)
          .limit(1)
          .get();
        if (!snapshot.empty) userId = snapshot.docs[0].id;
      }

      if (userId) {
        const priceItem = subscription.items.data[0].price;
        const priceId = priceItem.id;
        const amount = priceItem.unit_amount ? priceItem.unit_amount / 100 : 0;
        const interval = priceItem.recurring?.interval || 'month';
        const newRole = PRICE_ROLE_MAP[priceId] || 'pro';
        const endDate = Timestamp.fromMillis(
          subscription.current_period_end * 1000
        );

        console.log(
          `✅ Updated user ${userId}: role=${newRole}, amount=${amount}€`
        );

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

    // CASO 2: Suscripción cancelada
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const snapshot = await adminDb
        .collection('users')
        .where('stripeSubscriptionId', '==', subscription.id)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        console.log(`⚠️ Canceled subscription for user ${snapshot.docs[0].id}`);
        await snapshot.docs[0].ref.update({
          role: 'free',
          subscriptionStatus: 'canceled',
          planPrice: 0,
          currentPeriodEnd: null,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
