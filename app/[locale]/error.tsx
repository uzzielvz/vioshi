'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import EmptyState from '@/components/ui/EmptyState';
import { buttonClass } from '@/components/ui/styles';

// Page errors inside [locale] keep the header and translations.
export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('ui.errors');
  const { locale } = useLocaleContext();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState title={t('error_title')} body={t('error_body')} className="py-24">
      <button type="button" onClick={reset} className={buttonClass('primary')}>
        {t('retry')}
      </button>
      <Link href={`/${locale}`} className={buttonClass('soft')}>
        {t('home')}
      </Link>
    </EmptyState>
  );
}
