import type Stripe from 'stripe';

export type PaymentKind = 'card' | 'spei' | 'voucher';

type IntentLike = Pick<Stripe.PaymentIntent, 'payment_method' | 'next_action'>;
type SessionLike = Pick<Stripe.Checkout.Session, 'payment_method_types' | 'payment_status'>;

/**
 * The method the buyer actually used. `session.payment_method_types` lists
 * every method that was offered, so with card + OXXO + SPEI on it a card
 * payment used to be recorded as OXXO and SPEI got the wrong hold window.
 */
export function paymentKindFrom(intent: IntentLike | null, session: SessionLike): PaymentKind {
  const pm = intent?.payment_method;
  const type = pm && typeof pm === 'object' ? pm.type : undefined;
  const next = intent?.next_action?.type;

  if (type === 'oxxo' || next === 'oxxo_display_details') return 'voucher';
  if (type === 'customer_balance' || next === 'display_bank_transfer_instructions') return 'spei';
  if (type) return 'card';

  // Without the intent, the offered list only answers when it holds one method.
  const offered = session.payment_method_types ?? [];
  if (offered.length === 1 && offered[0] === 'oxxo') return 'voucher';
  if (offered.length === 1 && offered[0] === 'customer_balance') return 'spei';
  // Still unknown and unpaid means an async method: keep the longer hold
  // rather than release a voucher that can still be paid.
  return session.payment_status === 'paid' ? 'card' : 'voucher';
}
