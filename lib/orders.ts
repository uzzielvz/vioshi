import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

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
    return (data as OrderRow) ?? null;
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
