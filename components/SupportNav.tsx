'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

const links = [
  { key: 'customer_support', path: '/pages/customer-support' },
  { key: 'shipping_payments_returns', path: '/pages/shipping-payments-returns' },
  { key: 'accessibility', path: '/pages/accessibility' },
  { key: 'locations', path: '/pages/locaciones' },
] as const;

export default function SupportNav() {
  const t = useTranslations('header');
  const { locale } = useLocaleContext();
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 overflow-x-auto bg-white">
      <div className="flex gap-8 px-6 md:px-8">
        {links.map(({ key, path }) => {
          const isActive = pathname.includes(path);
          return (
            <Link
              key={key}
              href={`/${locale}${path}`}
              className="py-4 whitespace-nowrap border-b-2 transition-colors"
              style={{
                ...fontStyle,
                fontSize: '11px',
                fontWeight: isActive ? 500 : 400,
                borderBottomColor: isActive ? '#000' : 'transparent',
                color: isActive ? '#000' : '#666',
              }}
            >
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
