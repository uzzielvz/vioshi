import { getTranslations } from 'next-intl/server';
import { brand } from '@/lib/brand';
import HelpLayout, { HelpList, HelpSection } from '@/components/help/HelpLayout';

export default async function LegalPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations('ui.help');
  const b = { brand: brand.name };

  return (
    <HelpLayout locale={locale} active="legal" title={t('legal_title')}>
      <HelpSection title={t('terms_title')}>
        <p>{t('terms_p1', b)}</p>
        <p>{t('terms_p2', b)}</p>
      </HelpSection>

      <HelpSection title={t('privacy_title')}>
        <p>{t('privacy_p1', b)}</p>
        <h3 className="pt-2 font-semibold">{t('privacy_collect_title')}</h3>
        <HelpList
          items={[
            t('privacy_collect_1'),
            t('privacy_collect_2', b),
            t('privacy_collect_3'),
            t('privacy_collect_4'),
          ]}
        />
        <h3 className="pt-2 font-semibold">{t('privacy_use_title')}</h3>
        <HelpList
          items={[t('privacy_use_1'), t('privacy_use_2'), t('privacy_use_3', b), t('privacy_use_4')]}
        />
      </HelpSection>

      <HelpSection title={t('ip_title')}>
        <p>{t('ip_p', b)}</p>
      </HelpSection>

      <HelpSection title={t('cookies_title')}>
        <p>{t('cookies_p')}</p>
      </HelpSection>

      <HelpSection title={t('legal_contact_title')}>
        <p>
          {t.rich('legal_contact_p', {
            email: brand.legalEmail,
            link: (chunks) => (
              <a href={`mailto:${brand.legalEmail}`} className="font-semibold text-accent">
                {chunks}
              </a>
            ),
          })}
        </p>
      </HelpSection>
    </HelpLayout>
  );
}
