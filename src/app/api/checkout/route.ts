import { stripe, PRICE_ROLE_MAP } from '@/lib/stripe';
import { checkoutLimiter } from '@/lib/ratelimit';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const CheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID requerido'),
  userEmail: z.string().email('Email inválido'),
  userId: z.string().min(1, 'User ID requerido'),
});

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const { success } = await checkoutLimiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Intenta en 1 minuto.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    
    // Validar con Zod
    const { priceId, userEmail, userId } = CheckoutSchema.parse(body);

    // Detectar rol desde el mapa
    const targetRole = PRICE_ROLE_MAP[priceId] || 'pro';

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
      metadata: {
        userId,
        targetRole,
      },
      automatic_tax: { enabled: true },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/register?canceled=true`,
      tax_id_collection: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error creando sesión' },
      { status: 500 }
    );
  }
}

