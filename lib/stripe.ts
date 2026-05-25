
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Lazy-initialized Stripe client.
 * This prevents build failures in CI when STRIPE_SECRET_KEY is not present,
 * while still throwing at runtime if the key is missing when actually used.
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('Missing env var: STRIPE_SECRET_KEY');
    }

    if (secretKey.startsWith('pk_')) {
      throw new Error(
        'STRIPE_SECRET_KEY must be sk_test_... or sk_live_..., not the publishable pk_ key'
      );
    }

    stripeInstance = new Stripe(secretKey, {
      typescript: true,
    });
  }

  return stripeInstance;
}

// Convenience proxy so callers can use `stripe.foo()` syntax without calling getStripe() directly.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
