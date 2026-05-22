
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error('Missing env var: STRIPE_SECRET_KEY');
}

if (secretKey.startsWith('pk_')) {
  throw new Error(
    'STRIPE_SECRET_KEY must be sk_test_... or sk_live_..., not the publishable pk_ key'
  );
}

// Singleton — reused across hot-reloads in dev and across requests in prod.
// Never import this file in Client Components; it uses the secret key.
export const stripe = new Stripe(secretKey, {
  typescript: true,
});
