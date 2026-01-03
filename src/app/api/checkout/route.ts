import { stripe, PRICE_ROLE_MAP } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const CheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID requerido'),
  userEmail: z.string().email('Email inválido'),
  userId: z.string().min(1, 'User ID requerido'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validar con Zod
    const { priceId, userEmail, userId } = CheckoutSchema.parse(body);

    // Detectar rol desde el mapa
    const targetRole = PRICE_ROLE_MAP[priceId] || 'pro';

    // Construir la base URL
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

    console.log('🔍 Checkout:', { baseUrl, priceId, targetRole });

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
      automatic_tax: { enabled: false },
      success_url: `${baseUrl}/dashboard?payment_success=true`,
      cancel_url: `${baseUrl}/register?canceled=true`,
    });

    console.log('✅ Sesión creada:', session.id);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('❌ Checkout error:', error);
    
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
