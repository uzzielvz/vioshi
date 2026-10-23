import type { OrderRow } from '@/lib/orders';

export type OrderStage =
  | 'awaiting'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'expired'
  | 'failed'
  | 'refunded';

/**
 * Collapses `status` + `payment_status` into what the buyer sees.
 * Only a completed payment counts as paid: the Stripe webhook is the one
 * that sets it, so a return URL alone never shows an order as paid.
 */
export function orderStage(order: Pick<OrderRow, 'status' | 'payment_status'>): OrderStage {
  if (order.status === 'cancelled') return 'cancelled';
  if (order.payment_status === 'refunded') return 'refunded';
  if (order.payment_status === 'expired') return 'expired';
  if (order.payment_status === 'failed') return 'failed';
  if (order.payment_status !== 'completed') return 'awaiting';
  if (order.status === 'delivered') return 'delivered';
  if (order.status === 'shipped') return 'shipped';
  return 'paid';
}

/** Key under `ui.order.status` for the short label of a stage. */
export function stageLabelKey(stage: OrderStage, deliveryMethod: string) {
  if (stage === 'shipped') return deliveryMethod === 'pickup' ? 'ready' : 'on_the_way';
  return stage;
}
