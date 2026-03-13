'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/store/cartStore';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';

interface OrderSuccessPageProps {
  params: {
    locale: string;
    orderId: string;
  };
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { clearCart } = useCart();
  const t = useTranslations('success');
  const { locale } = useLocaleContext();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }}
    >
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center space-y-8">

          {/* Success mark */}
          <p style={{ fontSize: '48px', fontWeight: 200, lineHeight: 1, color: '#000' }}>✓</p>

          {/* Message */}
          <div className="space-y-2">
            <h1
              className="uppercase tracking-wide"
              style={{ fontSize: '11px', fontWeight: 600, color: '#000' }}
            >
              {t('confirmed')}
            </h1>
            <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.7' }}>
              {t('thank_you')}
            </p>
          </div>

          {/* Order Number */}
          <div className="border border-gray-200 p-6">
            <p
              className="uppercase tracking-wide mb-2"
              style={{ fontSize: '10px', color: '#999', letterSpacing: '0.05em' }}
            >
              {t('order_number')}
            </p>
            <p style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '0.05em', color: '#000' }}>
              #{params.orderId}
            </p>
          </div>

          {/* What's Next */}
          <div className="border-t border-gray-200 pt-8 space-y-4 text-left">
            <h2
              className="uppercase tracking-wide"
              style={{ fontSize: '11px', fontWeight: 500, color: '#000' }}
            >
              {t('whats_next')}
            </h2>
            <ul className="space-y-3">
              {(['step_1', 'step_2', 'step_3'] as const).map((step, i) => (
                <li key={step} className="flex items-start gap-3">
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#000', flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ fontSize: '11px', color: '#666', lineHeight: '1.6' }}>{t(step)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <Link
              href={`/${locale}/account/orders`}
              className="block w-full bg-black text-white py-2.5 uppercase hover:opacity-75 transition-opacity text-center"
              style={{ fontSize: '11px', letterSpacing: '0.05em' }}
            >
              {t('view_order')}
            </Link>
            <Link
              href={`/${locale}/collections/all`}
              className="block w-full border border-black text-black py-2.5 uppercase hover:bg-black hover:text-white transition-colors text-center"
              style={{ fontSize: '11px', letterSpacing: '0.05em' }}
            >
              {t('continue_shopping')}
            </Link>
          </div>

          {/* Support */}
          <div className="pt-4 border-t border-gray-200">
            <p style={{ fontSize: '11px', color: '#666' }}>
              {t('need_help')}{' '}
              <Link
                href={`/${locale}/pages/customer-support`}
                className="underline hover:opacity-60 transition-opacity"
                style={{ color: '#000' }}
              >
                {t('contact_support')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
