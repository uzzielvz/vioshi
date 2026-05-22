import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

/** Dev-only: inspect PaymentIntent status in Stripe (source of truth). */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const piId = req.nextUrl.searchParams.get('pi');
  if (!piId?.startsWith('pi_')) {
    return NextResponse.json(
      { error: 'Query param ?pi=pi_xxx required' },
      { status: 400 }
    );
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(piId);
    return NextResponse.json({
      id: intent.id,
      status: intent.status,
      amount: intent.amount,
      currency: intent.currency,
      last_payment_error: intent.last_payment_error?.message ?? null,
      payment_method: intent.payment_method,
      dashboard_url: `https://dashboard.stripe.com/test/payments/${intent.id}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe retrieve failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
