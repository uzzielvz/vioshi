import { redirect } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getOrdersByUser } from '@/lib/orders';
import { formatMxn } from '@/lib/formatters';
import { orderStage, stageLabelKey } from '@/lib/orderStage';
import type { Locale } from '@/i18n';
import EmptyState from '@/components/ui/EmptyState';
import { BagIcon, ChevronIcon } from '@/components/ui/icons';
import { buttonClass } from '@/components/ui/styles';
import AccountShell from '../_components/AccountShell';

interface Props {
  params: { locale: string };
}

export default async function OrdersPage({ params }: Props) {
  const locale = params.locale as Locale;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account`);
  }

  const [{ data: profile }, orders, t] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
    getOrdersByUser(),
    getTranslations('ui.order'),
  ]);

  const dateFormat = new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <AccountShell locale={locale} user={user} profileName={profile?.name ?? null} active="purchases">
      {orders.length === 0 ? (
        <EmptyState icon={<BagIcon />} title={t('empty_title')} body={t('empty_body')}>
          <Link href={`/${locale}`} className={buttonClass('primary')}>
            {t('explore')}
          </Link>
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line border-b border-line md:max-w-[720px]">
          {orders.map((order) => {
            const stage = orderStage(order);
            const closed = ['cancelled', 'expired', 'failed', 'refunded'].includes(stage);
            const cover = order.order_items.find((i) => i.product_image)?.product_image;
            const names = order.order_items.map((i) => i.product_name).join(', ');

            return (
              <li key={order.id}>
                <Link
                  href={`/${locale}/account/orders/${order.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-carton/50 md:px-0"
                >
                  <div className="h-[72px] w-14 flex-none overflow-hidden bg-carton">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className={clsx('h-full w-full object-cover mix-blend-multiply', closed && 'grayscale')}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-ink">{names}</p>
                    <p className="text-[12.5px] tabular-nums text-muted">
                      {order.order_number} · {dateFormat.format(new Date(order.created_at))}
                    </p>
                    <p className={clsx('text-[12.5px] font-medium', closed ? 'text-muted' : 'text-ink')}>
                      {t(`status.${stageLabelKey(stage, order.delivery_method)}`)}
                    </p>
                  </div>
                  <p className="text-[13.5px] font-bold tabular-nums text-ink">
                    {formatMxn(Number(order.total_mxn), locale)}
                  </p>
                  <ChevronIcon className="h-4 w-4 flex-none text-muted" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AccountShell>
  );
}
