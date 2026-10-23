import { getTranslations } from 'next-intl/server';
import { brand } from '@/lib/brand';
import HelpLayout, { HelpList, HelpSection } from '@/components/help/HelpLayout';

export default async function AccessibilityPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('ui.help');

  return (
    <HelpLayout
      locale={locale}
      active="a11y"
      title={t('a11y_title')}
      lead={t('a11y_p1', { brand: brand.name })}
    >
      <HelpSection title={t('a11y_list_title')}>
        <HelpList items={[t('a11y_1'), t('a11y_2'), t('a11y_3'), t('a11y_4'), t('a11y_5')]} />
      </HelpSection>
      <HelpSection title={t('a11y_feedback_title')}>
        <p>
          {t.rich('a11y_feedback_p', {
            email: brand.supportEmail,
            link: (chunks) => (
              <a href={`mailto:${brand.supportEmail}`} className="font-semibold text-accent">
                {chunks}
              </a>
            ),
          })}
        </p>
      </HelpSection>
    </HelpLayout>
  );
}
