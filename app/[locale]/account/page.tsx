'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';

function GoogleLogo() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const termsStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)',
};

export default function AccountPage() {
  const t = useTranslations('account');
  const { locale } = useLocaleContext();

  return (
    <div className="max-w-[320px] mx-auto px-4 md:px-6 py-6 md:py-8 min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-white border border-gray-200 p-5 flex-1">
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-wide mb-1">
              {t('email')}
            </label>
            <input
              type="email"
              placeholder={t('email_placeholder')}
              className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-black transition-colors placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wide mb-1">
              {t('password')}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border border-gray-200 p-2 text-xs focus:outline-none focus:border-black transition-colors placeholder:text-gray-400"
            />
          </div>

          <button
            type="button"
            className="w-full bg-black text-white py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-wide hover:opacity-80 transition-opacity"
          >
            {t('submit')}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white text-[10px] text-gray-500 uppercase tracking-wide">
                {t('or')}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-full border border-gray-200 py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-wide hover:border-black transition-colors flex items-center justify-center gap-1.5"
          >
            <GoogleLogo />
            {t('login_with_google')}
          </button>

          <div className="text-center">
            <Link
              href={`/${locale}/account/forgot-password`}
              className="text-[10px] text-gray-500 hover:text-black transition-colors"
            >
              {t('forgot_password')}
            </Link>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-200">
          <Link
            href={`/${locale}/account/register`}
            className="block w-full border border-black py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-wide text-center hover:bg-black hover:text-white transition-colors"
          >
            {t('create_account')}
          </Link>
        </div>
      </div>

      <p
        className="mt-8 pt-6 text-center text-[10px] uppercase tracking-wide text-gray-600 border-t border-gray-100"
        style={termsStyle}
      >
        {t('terms_intro')}{' '}
        <Link
          href={`/${locale}/pages/legal`}
          className="underline hover:text-black"
        >
          {t('terms_and_conditions')}
        </Link>
        {' '}{t('and')}{' '}
        <Link
          href={`/${locale}/pages/legal`}
          className="underline hover:text-black"
        >
          {t('privacy_policy')}
        </Link>
      </p>
    </div>
  );
}
