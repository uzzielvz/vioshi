import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n';
import { brand } from '@/lib/brand';
import { EXPRESS_SHIPPING_COST } from '@/lib/constants';
import { formatMxn } from '@/lib/formatters';
import { getActivePickupPoints } from '@/lib/pickupPoints';
import { getSettings } from '@/lib/settings';
import HelpLayout, { HelpList, HelpSection } from '@/components/help/HelpLayout';
import { textLinkClass } from '@/components/ui/styles';

export const revalidate = 60;

// Every number here comes from settings, pickup_points or lib/constants:
// the same sources the checkout charges from.
export default async function ShippingPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const [t, settings, points] = await Promise.all([
    getTranslations('ui.help'),
    getSettings(),
    getActivePickupPoints(),
  ]);
  const money = (amount: number) => formatMxn(amount, locale);

  const row = (label: string, value: string) => (
    <div key={label} className="flex justify-between gap-3 py-2.5">
      <dt className="min-w-0">{label}</dt>
      <dd className="flex-none font-semibold tabular-nums">{value}</dd>
    </div>
  );

  return (
    <HelpLayout locale={locale} active="shipping" title={t('shipping_title')}>
      <HelpSection title={t('pickup_title')}>
        <p>{t('pickup_body')}</p>
        {points.length > 0 && (
          <dl className="divide-y divide-line border-y border-line">
            {points.map((p) => row(p.name, p.additionalCost > 0 ? money(p.additionalCost) : t('free')))}
          </dl>
        )}
        <Link href={`/${locale}/pages/locaciones`} className={`justify-self-start text-[14px] ${textLinkClass}`}>
          {t('points_link')}
        </Link>
      </HelpSection>

      <HelpSection title={t('home_title')}>
        <dl className="divide-y divide-line border-y border-line">
          {row(t('home_standard'), money(settings.home_shipping_mxn))}
          {row(t('home_express'), money(EXPRESS_SHIPPING_COST))}
        </dl>
        <p className="text-muted">{t('home_note')}</p>
      </HelpSection>

      <HelpSection title={t('payments_title')}>
        <HelpList
          items={[
            t('pay_card'),
            t('pay_deferred', {
              threshold: money(settings.card_only_threshold_mxn),
              hours: settings.voucher_hours,
            }),
            t('pay_hold', { minutes: settings.card_reserve_minutes }),
            t('pay_inside', { brand: brand.name }),
          ]}
        />
      </HelpSection>

      <HelpSection title={t('returns_title')}>
        <p>{t('trouble_body')}</p>
      </HelpSection>
    </HelpLayout>
  );
}
