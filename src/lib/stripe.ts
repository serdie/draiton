import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
});

export const PRICE_ROLE_MAP: Record<string, string> = {
  'price_1SdamoDaJWPk1oF9vTeHa0g4': 'pro',
  'price_1Sdam5DaJWPk1oF9IQyia1Ui': 'pro',
  'price_1SdanqDaJWPk1oF94oQKfJ4c': 'empresa',
  'price_1Sdan8DaJWPk1oF9fRGdppbU': 'empresa',
};
