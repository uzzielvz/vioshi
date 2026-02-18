'use client';

import { useParams } from 'next/navigation';
import { Locale, currencyMap } from '@/i18n';

export function useLocaleContext(): { locale: Locale; currency: string } {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'es';
  const currency = currencyMap[locale] || 'MXN';

  return { locale, currency };
}
