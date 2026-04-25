import { Locale } from '@/i18n';

const EXCHANGE_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_MXN_RATE ?? '17.5');

export function formatPrice(
  priceInMXN: number,
  locale: Locale,
  showDecimals: boolean = true
): string {
  const currency = locale === 'es' ? 'MXN' : 'USD';
  const price = locale === 'es' ? priceInMXN : priceInMXN / EXCHANGE_RATE;

  return new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(price);
}
