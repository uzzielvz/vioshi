import { brand } from '@/lib/brand';
import type { createAdminClient } from '@/lib/supabase/admin';
import { buildOrderPaidEmail, type OrderPaidEmailInput } from './orderPaid';

type Supabase = ReturnType<typeof createAdminClient>;

const PAYMENT_LABELS: Record<string, string> = {
  card: 'tarjeta',
  oxxo: 'OXXO',
  spei: 'transferencia (SPEI)',
};

interface PaidOrder {
  id: string;
  order_number: string;
  email: string;
  first_name: string | null;
  subtotal_mxn: number;
  shipping_mxn: number;
  total_mxn: number;
  payment_method: string | null;
  delivery_method: string;
  pickup_point_id: string | null;
  shipping_address_id: string | null;
  guest_token: string | null;
  order_items: { product_name: string; size: string | null; total_price_mxn: number; product_image: string | null }[];
}

/**
 * Sends «Tu pedido está pagado» through Resend. Off until RESEND_API_KEY and
 * BRAND_EMAIL_FROM exist (they need the final domain). Resend's idempotency
 * key keeps a webhook retry from sending it twice.
 */
export async function sendOrderPaidEmail(
  supabase: Supabase,
  orderId: string
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !brand.emailFrom) return { sent: false, reason: 'not_configured' };

  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, order_number, email, first_name, subtotal_mxn, shipping_mxn, total_mxn, payment_method, delivery_method, pickup_point_id, shipping_address_id, guest_token, order_items(product_name, size, total_price_mxn, product_image)'
    )
    .eq('id', orderId)
    .maybeSingle();
  if (error || !data) return { sent: false, reason: `order: ${error?.message ?? 'not found'}` };
  const order = data as unknown as PaidOrder;
  if (!order.email || !order.guest_token) return { sent: false, reason: 'no_email_or_token' };

  let delivery: OrderPaidEmailInput['delivery'] = { kind: 'home', address: null };
  if (order.delivery_method === 'pickup' && order.pickup_point_id) {
    const { data: point } = await supabase
      .from('pickup_points')
      .select('name, address, city, available_hours')
      .eq('id', order.pickup_point_id)
      .maybeSingle();
    delivery = {
      kind: 'pickup',
      name: point?.name ?? 'el punto que elegiste',
      address: point ? [point.address, point.city].filter(Boolean).join(', ') : null,
      hours: point?.available_hours ?? null,
    };
  } else if (order.shipping_address_id) {
    const { data: addr } = await supabase
      .from('addresses')
      .select('street, apartment, colony, city, state, zip_code')
      .eq('id', order.shipping_address_id)
      .maybeSingle();
    delivery = {
      kind: 'home',
      address: addr
        ? [[addr.street, addr.apartment].filter(Boolean).join(' '), addr.colony, addr.city, addr.zip_code]
            .filter(Boolean)
            .join(', ')
        : null,
    };
  }

  const email = buildOrderPaidEmail({
    orderNumber: order.order_number,
    firstName: order.first_name,
    items: order.order_items.map((item) => ({
      name: item.product_name,
      size: item.size,
      priceMxn: Number(item.total_price_mxn),
      image: item.product_image,
    })),
    subtotalMxn: Number(order.subtotal_mxn),
    shippingMxn: Number(order.shipping_mxn),
    totalMxn: Number(order.total_mxn),
    paymentLabel: PAYMENT_LABELS[order.payment_method ?? ''] ?? 'tu método de pago',
    delivery,
    orderUrl: `${brand.siteUrl}/es/checkout/success/${encodeURIComponent(order.order_number)}?t=${order.guest_token}`,
    siteUrl: brand.siteUrl,
    brandName: brand.name,
    supportEmail: brand.supportEmail,
  });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `order-paid/${order.id}`,
    },
    body: JSON.stringify({
      from: brand.emailFrom,
      to: [order.email],
      reply_to: brand.supportEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });
  if (!res.ok) return { sent: false, reason: `resend ${res.status}: ${(await res.text()).slice(0, 200)}` };
  return { sent: true };
}
