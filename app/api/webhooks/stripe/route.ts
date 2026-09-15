import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

// Stripe manda el cuerpo crudo para verificar la firma — Next NO debe parsearlo.
export const runtime = 'nodejs';

type Supabase = ReturnType<typeof createAdminClient>;

/**
 * FLUJO DE PAGO Y STOCK
 *
 * La prenda se reserva al INICIAR el checkout (ver checkout/actions.ts), no
 * aquí. Este webhook solo decide el desenlace:
 *
 *   checkout.session.completed        pagado    → VENDIDA
 *                                     sin pagar → PAGO_PENDIENTE (extiende reserva)
 *   checkout.session.async_payment_succeeded    → VENDIDA
 *   checkout.session.async_payment_failed       → liberar
 *   checkout.session.expired                    → liberar
 *   payment_intent.payment_failed               → liberar
 *   customer_cash_balance_transaction.created   → detectar dinero atrapado
 *
 * NUNCA se marca vendida desde el navegador: el usuario puede cerrar la
 * pestaña, y con OXXO/SPEI el pago se confirma horas después.
 */

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

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    console.error('[webhook] Signature verification failed:', message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  if (process.env.NODE_ENV === 'development') {
    console.log('[webhook]', event.type, (event.data.object as { id?: string }).id);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Con OXXO/SPEI la sesión se "completa" cuando se emite el voucher o
        // las instrucciones de transferencia — ANTES de que llegue el dinero.
        if (session.payment_status === 'paid') {
          await venderPedido(supabase, session, 'checkout.session.completed');
        } else {
          await marcarEsperandoPago(supabase, session);
        }
        break;
      }

      // El dinero de OXXO/SPEI llegó de verdad.
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await venderPedido(supabase, session, 'async_payment_succeeded');
        break;
      }

      // El voucher venció o la transferencia nunca llegó.
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await liberarPedido(supabase, sessionOrderId(session), 'failed', 'async_payment_failed');
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await liberarPedido(supabase, sessionOrderId(session), 'expired', 'session.expired');
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await liberarPedido(
          supabase,
          intent.metadata?.order_id ?? null,
          'failed',
          'payment_intent.payment_failed'
        );
        break;
      }

      // Dinero que entró al saldo del cliente. Si no corresponde a un pedido
      // vivo queda atrapado: Stripe intenta devolverlo a los 75 días y a los
      // 90 lo barre a nuestro balance. Hay que verlo y devolverlo a mano.
      case 'customer_cash_balance_transaction.created': {
        await registrarFondosHuerfanos(supabase, event);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[webhook] ${event.type} falló:`, message);
    // 500 para que Stripe reintente.
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sessionOrderId(session: Stripe.Checkout.Session): string | null {
  return session.metadata?.order_id ?? null;
}

/** OXXO → 'voucher'. Transferencia SPEI → 'spei'. Lo demás → 'card'. */
function kindFromSession(session: Stripe.Checkout.Session): 'card' | 'spei' | 'voucher' {
  const types = session.payment_method_types ?? [];
  if (types.includes('oxxo')) return 'voucher';
  if (types.includes('customer_balance')) return 'spei';
  return 'card';
}

function paymentMethodLabel(session: Stripe.Checkout.Session): string {
  const kind = kindFromSession(session);
  return kind === 'voucher' ? 'oxxo' : kind === 'spei' ? 'spei' : 'card';
}

/**
 * Marca vendidas las prendas del pedido.
 *
 * mark_order_sold() es idempotente y nunca le quita una reserva viva a otro
 * pedido: si otra persona ya se llevó la prenda devuelve outcome='conflict',
 * y entonces el pedido se marca para revisión manual en vez de pasar en
 * silencio (el cliente pagó y no hay prenda que mandarle).
 */
async function venderPedido(
  supabase: Supabase,
  session: Stripe.Checkout.Session,
  origen: string
): Promise<void> {
  const orderId = sessionOrderId(session);
  if (!orderId) {
    console.error(`[webhook] ${origen}: sesión sin order_id en metadata`, session.id);
    return;
  }

  const { data: resultados, error } = await supabase.rpc('mark_order_sold', {
    p_order_id: orderId,
  });
  if (error) throw new Error(`mark_order_sold: ${error.message}`);

  const conflictos = ((resultados ?? []) as { outcome: string; product_name: string }[]).filter(
    (r) => r.outcome === 'conflict'
  );

  const patch: Record<string, unknown> = {
    payment_status: 'completed',
    status: 'processing',
    payment_method: paymentMethodLabel(session),
  };
  if (typeof session.payment_intent === 'string') {
    patch.payment_reference = session.payment_intent;
  }

  if (conflictos.length > 0) {
    const nombres = conflictos.map((c) => c.product_name).join(', ');
    patch.needs_review = true;
    patch.review_reason =
      `Pago confirmado pero la prenda ya no estaba disponible: ${nombres}. ` +
      `El cliente pagó y hay que devolverle o darle una alternativa.`;
    // Ruidoso a propósito: esto no puede pasar en silencio.
    console.error(`[webhook] CONFLICTO DE STOCK en pedido ${orderId}: ${nombres}`);
  }

  const { error: upErr } = await supabase.from('orders').update(patch).eq('id', orderId);
  if (upErr) throw new Error(`orders update: ${upErr.message}`);
}

/**
 * OXXO/SPEI: el voucher se emitió pero el dinero no ha llegado. La prenda
 * queda apartada con la ventana del método elegido, no con la de tarjeta.
 */
async function marcarEsperandoPago(
  supabase: Supabase,
  session: Stripe.Checkout.Session
): Promise<void> {
  const orderId = sessionOrderId(session);
  if (!orderId) return;

  const { error: extErr } = await supabase.rpc('extend_reservation_for_method', {
    p_order_id: orderId,
    p_kind: kindFromSession(session),
  });
  if (extErr) throw new Error(`extend_reservation_for_method: ${extErr.message}`);

  const patch: Record<string, unknown> = {
    payment_status: 'awaiting_payment',
    status: 'pending',
    payment_method: paymentMethodLabel(session),
  };
  if (typeof session.payment_intent === 'string') {
    patch.payment_reference = session.payment_intent;
  }

  const { error } = await supabase.from('orders').update(patch).eq('id', orderId);
  if (error) throw new Error(`orders update: ${error.message}`);
}

/** Libera la reserva. Idempotente: si ya se liberó, no hace nada. */
async function liberarPedido(
  supabase: Supabase,
  orderId: string | null,
  estadoPago: 'failed' | 'expired',
  origen: string
): Promise<void> {
  if (!orderId) {
    console.error(`[webhook] ${origen}: sin order_id`);
    return;
  }

  const { error: relErr } = await supabase.rpc('release_reservation', { p_order_id: orderId });
  if (relErr) throw new Error(`release_reservation: ${relErr.message}`);

  // No se pisa un pedido ya pagado: si el dinero entró, `completed` manda.
  const { error } = await supabase
    .from('orders')
    .update({ payment_status: estadoPago, status: 'cancelled' })
    .eq('id', orderId)
    .in('payment_status', ['pending', 'awaiting_payment']);
  if (error) throw new Error(`orders update: ${error.message}`);
}

/**
 * Dinero recibido en el saldo del cliente.
 *
 * Una transferencia SPEI que llega después de que la reserva venció NO rebota
 * al banco del cliente: se queda como saldo en Stripe. A los 75 días Stripe
 * intenta devolverla sola; a los 90, si no identificó la cuenta, la barre a
 * nuestro balance — dinero de alguien a quien no le entregamos nada.
 *
 * Se registra todo ingreso y se resuelve desde el admin.
 */
async function registrarFondosHuerfanos(supabase: Supabase, event: Stripe.Event): Promise<void> {
  const tx = event.data.object as {
    id: string;
    type?: string;
    net_amount?: number;
    currency?: string;
    customer?: string;
  };

  // Solo interesa la entrada de dinero, no las salidas ni las aplicaciones.
  if (tx.type !== 'funded') return;

  const monto = (tx.net_amount ?? 0) / 100;
  if (monto <= 0) return;

  // Idempotencia: stripe_transaction_id es unique, un reenvío no duplica.
  const { error } = await supabase.from('orphan_funds').upsert(
    {
      stripe_transaction_id: tx.id,
      stripe_customer_id: typeof tx.customer === 'string' ? tx.customer : null,
      amount_mxn: monto,
      currency: tx.currency ?? 'mxn',
      status: 'pendiente',
      notes: 'Detectado por customer_cash_balance_transaction.created',
    },
    { onConflict: 'stripe_transaction_id', ignoreDuplicates: true }
  );

  if (error) throw new Error(`orphan_funds: ${error.message}`);

  console.warn(
    `[webhook] Dinero recibido en saldo de cliente: $${monto} MXN (${tx.id}). ` +
      `Revisar en /admin/fondos — reloj de Stripe: 75d devolución automática, 90d barrido.`
  );
}
