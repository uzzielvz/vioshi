"use client";

import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';

export default function Footer() {
  const t = useTranslations('footer');
  const { locale } = useLocaleContext();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-black mt-auto border-t border-gray-200">
      <div className="flex items-center justify-between px-6 md:px-8 py-4">
        <div className="flex items-center gap-6">
          <a
            href="https://www.instagram.com/viogi_/?hl=es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-wide hover:opacity-60 transition-opacity"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            {t('instagram')}
          </a>
          <Link
            href={`/${locale}/vender`}
            className="text-xs uppercase tracking-wide hover:opacity-60 transition-opacity"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            {t('sell_with_us')}
          </Link>
          <Link
            href={`/${locale}/pages/legal`}
            className="text-xs uppercase tracking-wide hover:opacity-60 transition-opacity"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            {t('legal')}
          </Link>
        </div>
        <p
          className="text-xs uppercase tracking-wide"
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            fontSize: '11px',
            fontWeight: 500
          }}
          suppressHydrationWarning
        >
          {t('copyright', { year: currentYear })}
        </p>
      </div>
    </footer>
  );
}
