import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price_mxn: number;
  total_price_mxn: number;
}

export interface OrderRow {
  id: string;
  order_number: string;
  email: string;
  subtotal_mxn: number;
  tax_mxn: number;
  shipping_mxn: number;
  discount_mxn: number;
  total_mxn: number;
  status: string;
  payment_method: string | null;
  payment_status: string;
  delivery_method: string;
  shipping_method: string | null;
  pickup_point_id: string | null;
  pickup_date: string | null;
  pickup_time_slot: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const ORDER_SELECT = '*, order_items(*)' as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch one order by order_number.
 *
 * - Authenticated user: uses server client (RLS `orders_select_own` enforces
 *   that only the owner can read it).
 * - Guest: uses service role client and verifies the HMAC guest_token matches
 *   the stored value. Never exposes the token to the client.
 */
export async function getOrderByNumber(
  orderNumber: string,
  options: { userId?: string | null; guestToken?: string | null }
): Promise<OrderRow | null> {
  if (options.userId) {
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('order_number', orderNumber)
      .single();
    if (data) return data as OrderRow;
    // Sin `return null` a propósito: quien compró como invitado y después creó
    // cuenta tiene el pedido con user_id null, así que la RLS no se lo entrega.
    // Si trae el token de su correo, sigue siendo suyo y debe poder verlo.
  }

  if (options.guestToken) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('order_number', orderNumber)
      .eq('guest_token', options.guestToken)
      .single();
    return (data as OrderRow) ?? null;
  }

  return null;
}

/** Guest/authenticated lookup after Stripe redirect (payment_intent in query string). */
export async function getOrderByPaymentReference(
  paymentIntentId: string,
  options: { userId?: string | null; guestToken?: string | null }
): Promise<OrderRow | null> {
  if (options.userId) {
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('payment_reference', paymentIntentId)
      .single();
    if (data) return data as OrderRow;
    // Mismo caso que arriba: la sesión no invalida un guest_token válido.
  }

  if (options.guestToken) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('payment_reference', paymentIntentId)
      .eq('guest_token', options.guestToken)
      .single();
    return (data as OrderRow) ?? null;
  }

  return null;
}

/**
 * Lookup tras el redirect de Stripe (?session_id=cs_...).
 *
 * Es el único camino que le queda a un invitado que vuelve del pago: el
 * guest_token no viaja en la URL de retorno y `payment_intent` tampoco.
 *
 * El session_id viaja en la URL, así que NO basta con confiar en él: se
 * verifica CONTRA STRIPE antes de tocar la base, y además el pedido tiene que
 * ser el que Stripe trae en la metadata Y tener guardado ese mismo
 * stripe_session_id. Esa doble condición es lo que lo hace seguro sin token:
 * un `cs_...` inventado no existe en Stripe, y uno real solo lo tiene quien
 * hizo ese pago.
 */
export async function getOrderByStripeSession(sessionId: string): Promise<OrderRow | null> {
  if (!sessionId.startsWith('cs_')) return null;

  let orderId: string | undefined;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    orderId = session.metadata?.order_id;
  } catch (err) {
    console.error('[orders] no se pudo verificar la sesión con Stripe:', err);
    return null;
  }
  if (!orderId) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', orderId)
    .eq('stripe_session_id', sessionId)
    .single();
  return (data as OrderRow) ?? null;
}

/**
 * Fetch all orders for an authenticated user, newest first.
 * Uses the server client so RLS limits results to that user's orders.
 */
export async function getOrdersByUser(): Promise<OrderRow[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false });
  return (data as OrderRow[]) ?? [];
}

/**
 * Fetch a single order by its UUID for authenticated account pages.
 * RLS ensures only the owner can read it.
 */
export async function getOrderById(orderId: string): Promise<OrderRow | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', orderId)
    .single();
  return (data as OrderRow) ?? null;
}
