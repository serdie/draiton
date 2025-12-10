
import { NextResponse } from 'next/server';
import { Stripe } from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const { priceId, userEmail, userId } = await req.json();

    if (!priceId || !userEmail || !userId) {
      return NextResponse.json({ error: 'Faltan priceId, userEmail o userId.' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        metadata: {
          userId: userId,
        }
      },
      metadata: {
        userId: userId, 
      },
      automatic_tax: { enabled: true },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/seleccionar-plan?payment_canceled=true`,
      tax_id_collection: { enabled: true },
    });

    if (session.url) {
        return NextResponse.json({ url: session.url });
    } else {
        return NextResponse.json({ error: 'No se pudo crear la sesión de Stripe.' }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error al crear la sesión de checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
