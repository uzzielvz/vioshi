import clsx from 'clsx';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n';
import type { OrderRow } from '@/lib/orders';
import { formatMxn } from '@/lib/formatters';
import { orderStage } from '@/lib/orderStage';
import { createClient } from '@/lib/supabase/server';
import { buttonClass } from '@/components/ui/styles';

export interface OrderPickupPoint {
  name: string;
  address: string;
  city: string;
  available_hours: string | null;
  maps_url: string | null;
}

type StepState = 'ok' | 'now' | 'todo';

// Shared by the post-payment page and the order page in the profile.
export default async function OrderView({
  order,
  locale,
  pickup,
  customerName,
}: {
  order: OrderRow;
  locale: Locale;
  pickup: OrderPickupPoint | null;
  customerName?: string | null;
}) {
  const t = await getTranslations('ui.order');
  const stage = orderStage(order);
  const isPickup = order.delivery_method === 'pickup';
  const date = new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(order.created_at));

  const firstName = customerName?.trim().split(/\s+/)[0];
  const heading: Record<typeof stage, { title: string; body?: string }> = {
    paid: { title: firstName ? t('title_paid', { name: firstName }) : t('title_paid_anon') },
    shipped: { title: isPickup ? t('title_shipped_pickup') : t('title_shipped_home') },
    delivered: { title: t('title_delivered') },
    awaiting: { title: t('title_awaiting'), body: t('body_awaiting') },
    expired: { title: t('title_expired'), body: t('body_expired') },
    failed: { title: t('title_failed'), body: t('body_failed') },
    cancelled: { title: t('title_cancelled'), body: t('body_cancelled') },
    refunded: { title: t('title_refunded'), body: t('body_refunded') },
  };
  const { title, body } = heading[stage];

  const progress = stage === 'paid' ? 1 : stage === 'shipped' ? 2 : stage === 'delivered' ? 3 : 0;
  const stepState = (n: number): StepState => (progress >= n ? 'ok' : progress === n - 1 ? 'now' : 'todo');
  const steps = [
    { label: t('step_paid'), sub: date, state: stepState(1) },
    {
      label: isPickup ? t('step_ready') : t('step_on_the_way'),
      sub: isPickup
        ? t('step_ready_sub')
        : order.tracking_number
          ? `${t('tracking')}: ${order.tracking_number}`
          : t('step_on_the_way_sub'),
      state: stepState(2),
    },
    {
      label: t('step_delivered'),
      sub: isPickup ? t('step_delivered_sub_pickup') : t('step_delivered_sub_home'),
      state: stepState(3),
    },
  ];

  const pieceCount = order.order_items.reduce((n, item) => n + item.quantity, 0);
  const isPaid = progress > 0;
  const deliveryLabel = isPickup
    ? pickup
      ? t('delivery_at', { place: pickup.name })
      : t('delivery')
    : t('home_delivery');

  return (
    <div className="grid gap-5">
      <div className="grid gap-1.5">
        <p className="text-[12px] tabular-nums text-muted">
          {order.order_number} · {date}
        </p>
        <h1 className="text-[22px] font-bold leading-[1.2] tracking-[-0.015em] text-ink [text-wrap:balance]">{title}</h1>
        {body && <p className="text-[13.5px] leading-[1.45] text-muted">{body}</p>}
      </div>

      {isPaid && (
        <ol className="grid">
          {steps.map((step, i) => (
            <li
              key={step.label}
              aria-current={step.state === 'now' ? 'step' : undefined}
              className="relative grid grid-cols-[22px_1fr] gap-2.5 pb-4 text-[13.5px] last:pb-0"
            >
              {i < steps.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-0 left-[9.5px] top-4 w-px bg-line" />
              )}
              <span
                aria-hidden="true"
                className={clsx(
                  'relative z-[1] ml-1 mt-[3px] h-3 w-3 rounded-full border-[1.5px]',
                  step.state === 'ok' && 'border-ink bg-ink',
                  step.state === 'now' && 'border-accent bg-accent',
                  step.state === 'todo' && 'border-line bg-paper'
                )}
              />
              <div>
                <b className={clsx('block font-semibold', step.state === 'todo' ? 'text-muted' : 'text-ink')}>
                  {step.label}
                </b>
                <span className="text-[12.5px] text-muted">{step.sub}</span>
              </div>
            </li>
          ))}
        </ol>
      )}

      {isPaid && stage !== 'delivered' && isPickup && pickup && (
        <div className="grid gap-1 rounded-btn border border-line p-3.5 text-[13px]">
          <b className="text-[14px] font-semibold text-ink">{pickup.name}</b>
          <span className="text-muted">
            {pickup.address}, {pickup.city}
          </span>
          <span className="text-muted">
            {pickup.available_hours ? `${pickup.available_hours} · ` : ''}
            {t('place_hint')}
          </span>
          {pickup.maps_url && (
            <a
              href={pickup.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass('line', 'sm', 'mt-2 w-full')}
            >
              {t('directions')}
            </a>
          )}
        </div>
      )}

      <div>
        <ul className="divide-y divide-line border-y border-line">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="h-20 w-16 flex-none overflow-hidden bg-carton">
                {item.product_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.product_image} alt="" className="h-full w-full object-cover mix-blend-multiply" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold text-ink">{item.product_name}</p>
                {item.size && <p className="text-[12.5px] text-muted">{t('size', { size: item.size })}</p>}
              </div>
              <p className="text-[13.5px] font-semibold tabular-nums text-ink">
                {formatMxn(Number(item.total_price_mxn), locale)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="grid gap-1.5 py-3.5 text-[13.5px]">
          <div className="flex justify-between gap-3">
            <dt>{t('pieces', { count: pieceCount })}</dt>
            <dd className="tabular-nums">{formatMxn(Number(order.subtotal_mxn), locale)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>{deliveryLabel}</dt>
            <dd className="tabular-nums">{formatMxn(Number(order.shipping_mxn), locale)}</dd>
          </div>
          {Number(order.discount_mxn) > 0 && (
            <div className="flex justify-between gap-3">
              <dt>{t('discount')}</dt>
              <dd className="tabular-nums">−{formatMxn(Number(order.discount_mxn), locale)}</dd>
            </div>
          )}
          <div className="mt-1 flex justify-between gap-3 border-t border-line pt-2 text-[15px] font-bold">
            <dt>{isPaid ? t('total_paid') : t('total')}</dt>
            <dd className="tabular-nums">{formatMxn(Number(order.total_mxn), locale)}</dd>
          </div>
        </dl>
        <p className="text-[12.5px] text-muted">
          {t('contact')}: {order.email}
        </p>
      </div>
    </div>
  );
}

/** Pickup point shown on the order. `pickup_points` is public-read. */
export async function loadOrderPickupPoint(pickupPointId: string | null): Promise<OrderPickupPoint | null> {
  if (!pickupPointId) return null;
  const { data } = await createClient()
    .from('pickup_points')
    .select('name, address, city, available_hours, maps_url')
    .eq('id', pickupPointId)
    .maybeSingle();
  return (data as OrderPickupPoint | null) ?? null;
}
