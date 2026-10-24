import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n';
import { brand } from '@/lib/brand';
import { formatMxn } from '@/lib/formatters';
import { getSettings } from '@/lib/settings';
import HelpLayout, { HelpSection } from '@/components/help/HelpLayout';
import { ChevronIcon } from '@/components/ui/icons';
import { buttonClass } from '@/components/ui/styles';

export const revalidate = 60;

export default async function CustomerSupportPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const [t, settings] = await Promise.all([getTranslations('ui.help'), getSettings()]);

  const contacts = [
    { label: t('instagram'), value: brand.instagramUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\?.*$/, ''), href: brand.instagramUrl },
    { label: t('email'), value: brand.supportEmail, href: `mailto:${brand.supportEmail}` },
    ...(brand.whatsapp
      ? [{ label: t('whatsapp'), value: `+${brand.whatsapp}`, href: `https://wa.me/${brand.whatsapp}` }]
      : []),
  ];

  return (
    <HelpLayout
      locale={locale}
      active="help"
      title={t('help_title', { brand: brand.name })}
      lead={t('help_lead')}
    >
      <HelpSection title={t('buy_title')}>
        <p>{t('buy_body')}</p>
      </HelpSection>
      <HelpSection title={t('pay_title')}>
        <p>
          {t('pay_body', {
            brand: brand.name,
            threshold: formatMxn(settings.card_only_threshold_mxn, locale),
          })}
        </p>
      </HelpSection>
      <HelpSection title={t('receive_title')}>
        <p>{t('receive_body')}</p>
      </HelpSection>
      <HelpSection title={t('trouble_title')}>
        <p>{t('trouble_body')}</p>
      </HelpSection>
      <HelpSection title={t('sell_title')}>
        <p>{t('sell_body')}</p>
        <Link href={`/${locale}/vender`} className={buttonClass('soft', 'sm', 'justify-self-start')}>
          {t('sell_cta')}
        </Link>
      </HelpSection>
      <HelpSection title={t('contact_title')}>
        <p className="text-muted">{t('contact_body')}</p>
        <ul className="divide-y divide-line border-y border-line">
          {contacts.map((c) => (
            <li key={c.label}>
              <a
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="font-semibold">{c.label}</span>
                <span className="flex min-w-0 items-center gap-1.5 text-muted">
                  <span className="truncate">{c.value}</span>
                  <ChevronIcon className="h-4 w-4 flex-none" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </HelpSection>
    </HelpLayout>
  );
}
