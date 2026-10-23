import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  getOrderByNumber,
  getOrderByPaymentReference,
  getOrderByStripeSession,
} from '@/lib/orders';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import OrderView, { loadOrderPickupPoint } from '@/components/order/OrderView';
import EmptyState from '@/components/ui/EmptyState';
import { BagIcon } from '@/components/ui/icons';
import { buttonClass, textLinkClass } from '@/components/ui/styles';
import ClearCartOnMount from './_components/ClearCartOnMount';

interface Props {
  params: { locale: string; orderId: string };
  searchParams: {
    t?: string;
    session_id?: string;
    payment_intent?: string;
    redirect_status?: string;
  };
}

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { orderId: orderNumberParam } = params;
  const locale = params.locale as Locale;
  const orderNumber = decodeURIComponent(orderNumberParam);
  const guestToken = searchParams.t ?? null;
  const sessionId = searchParams.session_id ?? null;
  const paymentIntentId = searchParams.payment_intent ?? null;

  // Resolve current user (may be null for guests)
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const lookupOpts = { userId: user?.id ?? null, guestToken };

  // Tres caminos, y ninguno resuelve un pedido a partir de un identificador
  // adivinable:
  //   1. order_number + sesión del usuario (RLS) o + guest_token (HMAC)
  //   2. payment_intent + esa misma prueba de identidad
  //   3. session_id, verificado CONTRA STRIPE antes de tocar la base
  //
  // El 3 es el que usa el retorno de Stripe: es lo único que trae la URL
  // (`/checkout/return` redirige con `?session_id=`), y sessionStorage no
  // sobrevive si el cliente vuelve desde otra pestaña o desde el banco.
  const order =
    (await getOrderByNumber(orderNumber, lookupOpts)) ??
    (paymentIntentId && (user || guestToken)
      ? await getOrderByPaymentReference(paymentIntentId, lookupOpts)
      : null) ??
    (sessionId ? await getOrderByStripeSession(sessionId) : null);

  const t = await getTranslations('ui.order');

  if (!order) {
    return (
      <EmptyState icon={<BagIcon />} title={t('not_found_title')} body={t('not_found_body')} className="py-20">
        <Link href={`/${locale}/account/orders`} className={buttonClass('primary')}>
          {t('see_purchases')}
        </Link>
      </EmptyState>
    );
  }

  const pickup = await loadOrderPickupPoint(order.delivery_method === 'pickup' ? order.pickup_point_id : null);
  const profileName = user
    ? (await supabase.from('profiles').select('name').eq('id', user.id).maybeSingle()).data?.name ?? null
    : null;

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-12 pt-6 md:pt-10">
      {/* Clear cart from localStorage once the order is confirmed */}
      <ClearCartOnMount />

      <OrderView order={order} locale={locale} pickup={pickup} customerName={profileName} />

      <div className="mt-6 grid gap-2">
        {user && (
          <Link href={`/${locale}/account/orders/${order.id}`} className={buttonClass('line', 'md', 'w-full')}>
            {t('see_order')}
          </Link>
        )}
        <Link href={`/${locale}`} className={buttonClass('soft', 'md', 'w-full')}>
          {t('keep_browsing')}
        </Link>
      </div>

      <p className="mt-6 text-center text-[13px] text-ink">
        {t.rich('help', {
          link: (chunks) => (
            <Link href={`/${locale}/pages/customer-support`} className={textLinkClass}>
              {chunks}
            </Link>
          ),
        })}
      </p>
    </div>
  );
}
