import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

// Stripe sends the raw body for signature verification — Next.js must NOT
// parse it as JSON. We read it as text and let the Stripe SDK verify it.
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // ── Verify signature ────────────────────────────────────────────────────────
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('[webhook] Signature verification failed:', message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const supabase = createAdminClient();

  // ── Handle events ───────────────────────────────────────────────────────────
  // Each handler is idempotent: UPDATE ... WHERE payment_reference = X
  // is a no-op if the row is already in the target state.

  if (process.env.NODE_ENV === 'development') {
    console.log('[webhook] event:', event.type, (event.data.object as { id?: string }).id);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent;
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'completed', status: 'processing' })
        .eq('payment_reference', intent.id);

      if (error) {
        console.error('[webhook] payment_intent.succeeded — DB update failed:', error.message);
        // Return 500 so Stripe retries the event
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('payment_reference', intent.id);

      if (error) {
        console.error('[webhook] payment_intent.payment_failed — DB update failed:', error.message);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }
      break;
    }

    default:
      // Ignore unhandled event types — return 200 so Stripe stops retrying them
      break;
  }

  return NextResponse.json({ received: true });
}
