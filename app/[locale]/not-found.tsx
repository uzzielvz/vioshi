import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import EmptyState from '@/components/ui/EmptyState';
import { SearchIcon } from '@/components/ui/icons';
import { buttonClass } from '@/components/ui/styles';

// notFound() inside [locale] and unknown URLs (see [...rest]) land here, with the store shell.
export default async function LocaleNotFound() {
  const [t, locale] = await Promise.all([getTranslations('ui.errors'), getLocale()]);

  return (
    <EmptyState icon={<SearchIcon />} title={t('nf_title')} body={t('nf_body')} className="py-24">
      <Link href={`/${locale}`} className={buttonClass('primary')}>
        {t('nf_cta')}
      </Link>
    </EmptyState>
  );
}
