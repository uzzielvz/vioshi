/**
 * Usage: node scripts/stripe-check-pi.mjs pi_xxxxxxxx
 * Reads STRIPE_SECRET_KEY from .env.local — same truth as Stripe Dashboard.
 */
import fs from 'fs';
import Stripe from 'stripe';

const piId = process.argv[2];
if (!piId?.startsWith('pi_')) {
  console.error('Usage: node scripts/stripe-check-pi.mjs pi_xxxxxxxx');
  process.exit(1);
}

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1).trim()];
    })
);

const key = env.STRIPE_SECRET_KEY;
if (!key?.startsWith('sk_')) {
  console.error('STRIPE_SECRET_KEY missing or not a secret key (sk_) in .env.local');
  process.exit(1);
}

const stripe = new Stripe(key);
const intent = await stripe.paymentIntents.retrieve(piId);

console.log('\n--- PaymentIntent (Stripe API) ---');
console.log('id:      ', intent.id);
console.log('status:  ', intent.status);
console.log('amount:  ', intent.amount, intent.currency);
if (intent.last_payment_error) {
  console.log('error:   ', intent.last_payment_error.message);
  console.log('code:    ', intent.last_payment_error.code);
}
console.log('dashboard:', `https://dashboard.stripe.com/test/payments/${intent.id}`);
console.log('');

const ok = intent.status === 'succeeded';
process.exit(ok ? 0 : 1);
