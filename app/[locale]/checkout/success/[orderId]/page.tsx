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
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <Link href={`/${locale}`} className="font-logo text-2xl tracking-wider">
              VIOGI
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-8">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold uppercase tracking-wider">
                {t('confirmed')}
              </h1>
              <p className="text-gray-600">
                {t('thank_you')}
              </p>
            </div>

            {/* Order Number */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  {t('order_number')}
                </p>
                <p className="text-2xl font-bold tracking-wider">
                  #{params.orderId}
                </p>
              </div>
            </div>

            {/* What's Next */}
            <div className="border-t border-gray-200 pt-8 space-y-4 text-left">
              <h2 className="text-sm uppercase tracking-wider font-medium">
                {t('whats_next')}
              </h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>{t('step_1')}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>{t('step_2')}</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>{t('step_3')}</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="pt-8 space-y-4">
              <Link
                href={`/${locale}/account/orders`}
                className="block w-full bg-black text-white py-4 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors text-center"
              >
                {t('view_order')}
              </Link>
              <Link
                href={`/${locale}/collections/all`}
                className="block w-full border-2 border-black text-black py-4 rounded uppercase tracking-wider font-medium hover:bg-black hover:text-white transition-colors text-center"
              >
                {t('continue_shopping')}
              </Link>
            </div>

            {/* Support */}
            <div className="pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {t('need_help')}{' '}
                <Link
                  href={`/${locale}/pages/customer-support`}
                  className="underline font-medium text-black"
                >
                  {t('contact_support')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
