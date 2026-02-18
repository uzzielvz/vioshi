import { getRequestConfig } from 'next-intl/server';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const currencyMap: Record<Locale, string> = {
  es: 'MXN',
  en: 'USD',
};

export default getRequestConfig(async ({ requestLocale }) => {
  // next-intl v4: requestLocale is a Promise
  let locale = await requestLocale;

  // Fallback to default if locale is invalid or undefined
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
