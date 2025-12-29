import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

export const PRICE_ROLE_MAP: Record<string, string> = {
  'price_1SdanqDaJWPk1oF94oQKfJ4c': 'empresa',  // Plan empresa mes a mes
  'price_1Sdan8DaJWPk1oF9fRGdppbU': 'empresa',  // Plan empresa anual
  'price_1SdamoDaJWPk1oF9vTeHa0g4': 'pro',      // Plan Pro (Autónomo) mes a mes
  'price_1Sdam5DaJWPk1oF9IQyia1Ui': 'pro',      // Plan Pro (Autónomo) anual
};
