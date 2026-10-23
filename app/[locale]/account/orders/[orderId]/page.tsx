import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getOrderById } from '@/lib/orders';
import type { Locale } from '@/i18n';
import OrderView, { loadOrderPickupPoint } from '@/components/order/OrderView';
import { textLinkClass } from '@/components/ui/styles';
import AccountSubpage from '../../_components/AccountSubpage';

interface Props {
  params: { locale: string; orderId: string };
}

export default async function OrderDetailPage({ params }: Props) {
  const locale = params.locale as Locale;
  const { orderId } = params;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account`);
  }

  const order = await getOrderById(orderId);
  if (!order) notFound();

  const [pickup, t, { data: profile }] = await Promise.all([
    loadOrderPickupPoint(order.delivery_method === 'pickup' ? order.pickup_point_id : null),
    getTranslations('ui.order'),
    supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
  ]);

  return (
    <AccountSubpage backHref={`/${locale}/account/orders`} backLabel={t('back')}>
      <OrderView order={order} locale={locale} pickup={pickup} customerName={profile?.name ?? null} />
      <p className="mt-6 text-[13px] text-ink">
        {t.rich('help', {
          link: (chunks) => (
            <Link href={`/${locale}/pages/customer-support`} className={textLinkClass}>
              {chunks}
            </Link>
          ),
        })}
      </p>
    </AccountSubpage>
  );
}
