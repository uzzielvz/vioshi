import { getTranslations } from 'next-intl/server';
import { MEASUREMENT_KEYS, MEASUREMENT_LABELS, MEASUREMENT_LABELS_EN } from '@/lib/garments';
import HelpLayout, { HelpList, HelpSection } from '@/components/help/HelpLayout';

// Second-hand pieces carry their own measurements, so this page explains how
// to read them instead of showing a generic size chart.
export default async function SizeGuidePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('ui.help');
  const labels = locale === 'en' ? MEASUREMENT_LABELS_EN : MEASUREMENT_LABELS;

  return (
    <HelpLayout locale={locale} active="sizes" title={t('sizes_title')} lead={t('sizes_lead')}>
      <HelpSection title={t('sizes_how_title')}>
        <HelpList ordered items={[t('sizes_how_1'), t('sizes_how_2'), t('sizes_how_3')]} />
      </HelpSection>
      <HelpSection title={t('sizes_points_title')}>
        <dl className="divide-y divide-line border-y border-line">
          {MEASUREMENT_KEYS.map((key) => (
            <div key={key} className="grid gap-0.5 py-3 md:grid-cols-[140px_1fr] md:gap-4">
              <dt className="font-semibold">{labels[key]}</dt>
              <dd className="text-muted">{t(`m_${key}`)}</dd>
            </div>
          ))}
        </dl>
        <p className="text-muted">{t('sizes_note')}</p>
      </HelpSection>
    </HelpLayout>
  );
}
