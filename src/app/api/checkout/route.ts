import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const { priceId, userEmail, userId } = await req.json();

    if (!priceId || !userEmail || !userId) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
    }

    // LISTAS DE PRECIOS (Más ordenado y seguro)
    const proPrices = [
        'price_1Sd7uhJ6FVppO7DRWoVImZmw', // Pro Mensual
        'price_1Sd7wCJ6FVppO7DRaQ6eRJgQ'  // Pro Anual
    ];

    const empresaPrices = [
        'price_1Sd7wpJ6FVppO7DRofNQGErY', // Empresa Mensual
        'price_1Sd7xeJ6FVppO7DRZPKWfniC'  // Empresa Anual
    ];

    // LÓGICA DE DETECCIÓN DE ROL
    let targetRole = 'free'; // Por seguridad empezamos en free

    if (proPrices.includes(priceId)) {
        targetRole = 'pro';
    } else if (empresaPrices.includes(priceId)) {
        targetRole = 'empresa';
    } else {
        // Si el precio no está en ninguna lista, algo raro pasa.
        // Podríamos lanzar error, o dejarlo en 'pro' por defecto si prefieres.
        targetRole = 'pro'; 
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
      // Guardamos el rol detectado en los metadatos
      metadata: {
        userId: userId,
        targetRole: targetRole 
      },
      automatic_tax: { enabled: true },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/register?canceled=true`,
      tax_id_collection: { enabled: true },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creando sesión:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
