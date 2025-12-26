import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe, PRICE_ROLE_MAP } from '@/lib/stripe';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { webhookLimiter } from '@/lib/ratelimit';


const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper: Validar que userId existe y es válido
async function validateUserId(userId: string): Promise<boolean> {
  if (!userId || typeof userId !== 'string' || userId.length === 0) {
    return false;
  }
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    return userDoc.exists;
  } catch (error) {
    console.error('Error validating userId:', userId, error);
    return false;
  }
}

// Helper: Registrar evento de pago para auditoría
async function logPaymentEvent(
  eventType: string,
  userId: string,
  data: Record<string, any>
) {
  try {
    await adminDb.collection('payment_logs').add({
      eventType,
      userId,
      data,
      timestamp: FieldValue.serverTimestamp(),
      ip: headers().get('x-forwarded-for') || 'unknown',
    });
  } catch (error) {
    console.error('Error logging payment event:', error);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature');

  // ================================================================
// VALIDACIÓN 0: Rate Limiting
// ================================================================
const ip = headers().get('x-forwarded-for') || headers().get('x-real-ip') || 'unknown';
const { success, remaining } = await webhookLimiter.limit(ip);

if (!success) {
  console.error('❌ RATE LIMIT EXCEEDED:', { ip, remaining });
  return NextResponse.json(
    { error: 'Rate limit exceeded' },
    { status: 429 }
  );
}

  // ================================================================
  // VALIDACIÓN 1: Verificar que tenemos firma y secret
  // ================================================================
  if (!signature) {
    console.error('❌ WEBHOOK ERROR: Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error('❌ WEBHOOK ERROR: STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    );
  }

  // ================================================================
  // VALIDACIÓN 2: Construir y validar evento
  // ================================================================
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('❌ WEBHOOK SIGNATURE ERROR:', {
      message: err.message,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 401 }
    );
  }

  // ================================================================
  // PROCESAR EVENTOS
  // ================================================================
  try {
    // EVENTO 1: Checkout completado
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;

      // Validar userId
      if (!userId || !(await validateUserId(userId))) {
        console.error('❌ Invalid userId from checkout session:', userId);
        await logPaymentEvent('checkout.failed', userId || 'unknown', {
          reason: 'invalid_user_id',
          session_id: session.id,
        });
        return NextResponse.json(
          { error: 'Invalid user' },
          { status: 400 }
        );
      }

      try {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const priceItem = subscription.items.data[0]?.price;
        if (!priceItem) {
          throw new Error('No price item found in subscription');
        }

        const priceId = priceItem.id;
        const amount = priceItem.unit_amount ? priceItem.unit_amount / 100 : 0;
        const interval = priceItem.recurring?.interval || 'month';
        const newRole = PRICE_ROLE_MAP[priceId] || 'pro';
        const endDate = Timestamp.fromMillis(
          (subscription as any).current_period_end * 1000
        );

        // Actualizar usuario
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

        // Registrar evento
        await logPaymentEvent('checkout.success', userId, {
          session_id: session.id,
          subscription_id: subscription.id,
          amount,
          role: newRole,
        });

        console.log(
          `✅ Checkout completed: user=${userId}, role=${newRole}, amount=${amount}€`
        );
      } catch (error) {
        console.error('❌ Error processing checkout:', error);
        await logPaymentEvent('checkout.processing_error', userId, {
          error: String(error),
          session_id: session.id,
        });
        throw error;
      }
    }

    // EVENTO 2: Suscripción actualizada
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as any;

      try {
        const snapshot = await adminDb
          .collection('users')
          .where('stripeSubscriptionId', '==', subscription.id)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const userId = snapshot.docs[0].id;
          const priceItem = subscription.items.data[0]?.price;

          if (priceItem) {
            const priceId = priceItem.id;
            const amount = priceItem.unit_amount
              ? priceItem.unit_amount / 100
              : 0;
            const interval = priceItem.recurring?.interval || 'month';
            const newRole = PRICE_ROLE_MAP[priceId] || 'pro';
            const endDate = Timestamp.fromMillis(
              subscription.current_period_end * 1000
            );

            await adminDb.collection('users').doc(userId).update({
              role: newRole,
              planPrice: amount,
              planInterval: interval,
              currentPeriodEnd: endDate,
              subscriptionStatus: subscription.status,
              updatedAt: FieldValue.serverTimestamp(),
            });

            await logPaymentEvent('subscription.updated', userId, {
              subscription_id: subscription.id,
              amount,
              role: newRole,
              status: subscription.status,
            });

            console.log(
              `✅ Subscription updated: user=${userId}, role=${newRole}`
            );
          }
        }
      } catch (error) {
        console.error('❌ Error processing subscription update:', error);
        await logPaymentEvent('subscription.update_error', 'unknown', {
          error: String(error),
          subscription_id: subscription.id,
        });
        throw error;
      }
    }

    // EVENTO 3: Suscripción cancelada
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;

      try {
        const snapshot = await adminDb
          .collection('users')
          .where('stripeSubscriptionId', '==', subscription.id)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const userId = snapshot.docs[0].id;

          await snapshot.docs[0].ref.update({
            role: 'free',
            subscriptionStatus: 'canceled',
            planPrice: 0,
            currentPeriodEnd: null,
            updatedAt: FieldValue.serverTimestamp(),
          });

          await logPaymentEvent('subscription.canceled', userId, {
            subscription_id: subscription.id,
            reason: subscription.cancellation_details?.reason || 'unknown',
          });

          console.log(`⚠️ Subscription canceled: user=${userId}`);
        }
      } catch (error) {
        console.error('❌ Error processing subscription cancellation:', error);
        await logPaymentEvent(
          'subscription.cancellation_error',
          'unknown',
          {
            error: String(error),
            subscription_id: subscription.id,
          }
        );
        throw error;
      }
    }

    // EVENTO 4: Error de pago
    if (event.type === 'charge.failed') {
      const charge = event.data.object as any;
      console.error('❌ Payment failed:', {
        charge_id: charge.id,
        failure_code: charge.failure_code,
        failure_message: charge.failure_message,
      });

      await logPaymentEvent('charge.failed', charge.metadata?.userId || 'unknown', {
        charge_id: charge.id,
        failure_code: charge.failure_code,
        failure_message: charge.failure_message,
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('❌ WEBHOOK PROCESSING ERROR:', {
      error: String(error),
      eventType: event?.type,
      timestamp: new Date().toISOString(),
    });

    // Log el error pero devolver 200 para que Stripe no reintente infinitamente
    await logPaymentEvent('webhook.error', 'unknown', {
      error: String(error),
      event_type: event?.type,
    });

    return NextResponse.json(
      { received: true, processed: false },
      { status: 200 }
    );
  }
}
