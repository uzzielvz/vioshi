import Stripe from 'stripe';

// Lazy singleton — instantiated on first use, not at module evaluation time.
// This lets the Next.js build succeed without STRIPE_SECRET_KEY set,
// while still throwing at runtime if it is missing when actually called.
// Never import this file in Client Components; it uses the secret key.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing env var: STRIPE_SECRET_KEY');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-04-22.dahlia',
      typescript: true,
    });
  }
  return _stripe;
}

// Convenience re-export for callers that prefer `stripe.foo()` syntax.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
