/**
 * Pure rules of the payment flow, no network or database.
 *
 *   npm run test:rules
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type Stripe from 'stripe';
import { uniquePieces } from '../lib/cart/uniquePieces';
import { paymentKindFrom } from '../lib/stripe/paymentKind';

const offeredAll = ['card', 'oxxo', 'customer_balance'];
const session = (payment_status: string, types = offeredAll) =>
  ({ payment_status, payment_method_types: types }) as unknown as Stripe.Checkout.Session;
const intent = (type?: string, next?: string) =>
  ({
    payment_method: type ? ({ type } as Stripe.PaymentMethod) : null,
    next_action: next ? ({ type: next } as Stripe.PaymentIntent.NextAction) : null,
  }) as Stripe.PaymentIntent;

test('card payment with every method offered is card, not OXXO', () => {
  assert.equal(paymentKindFrom(intent('card'), session('paid')), 'card');
});

test('OXXO voucher issued is voucher', () => {
  assert.equal(paymentKindFrom(intent('oxxo', 'oxxo_display_details'), session('unpaid')), 'voucher');
});

test('SPEI instructions are spei', () => {
  assert.equal(paymentKindFrom(intent('customer_balance'), session('unpaid')), 'spei');
  assert.equal(paymentKindFrom(intent(undefined, 'display_bank_transfer_instructions'), session('unpaid')), 'spei');
});

test('without the intent, a single offered method decides', () => {
  assert.equal(paymentKindFrom(null, session('unpaid', ['oxxo'])), 'voucher');
  assert.equal(paymentKindFrom(null, session('unpaid', ['customer_balance'])), 'spei');
  assert.equal(paymentKindFrom(null, session('paid', ['card'])), 'card');
});

test('unknown and unpaid keeps the long hold', () => {
  assert.equal(paymentKindFrom(null, session('unpaid')), 'voucher');
});

test('a bag saved with quantity 2 is charged once', () => {
  const items = uniquePieces([
    { productId: 'a', quantity: 2 },
    { productId: 'b', quantity: 1 },
    { productId: 'a', quantity: 1 },
  ]);
  assert.deepEqual(items, [
    { productId: 'a', quantity: 1 },
    { productId: 'b', quantity: 1 },
  ]);
});
