'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';

function GoogleLogo() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function AccountPage() {
  const t = useTranslations('account');
  const { locale } = useLocaleContext();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div
        className="bg-gray-50 w-full max-w-sm px-8 py-10"
        style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }}
      >

        {/* Logo — idéntico al header */}
        <div className="text-center mb-6">
          <span
            className="text-lg font-bold text-black"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)',
            }}
          >
            VIOGI
          </span>
        </div>

        {/* Titles */}
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-0.5">
          {t('sign_in')}
        </p>
        <p className="text-[9px] uppercase tracking-[0.15em] text-gray-400 mb-5">
          {t('sign_in_or_create')}
        </p>

        {/* Continue with Google */}
        <button
          type="button"
          className="w-full border border-gray-300 py-2.5 text-[9px] uppercase tracking-[0.2em] hover:border-black transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <GoogleLogo />
          {t('login_with_google')}
        </button>

        {/* OR */}
        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-gray-50 text-[8px] text-gray-300 uppercase tracking-[0.3em]">
              {t('or')}
            </span>
          </div>
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder={t('email_placeholder')}
          className="w-full border border-gray-300 px-3 py-2.5 text-[11px] uppercase tracking-[0.15em] placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors bg-transparent mb-3"
        />

        {/* Password */}
        <input
          type="password"
          placeholder={t('password')}
          className="w-full border border-gray-300 px-3 py-2.5 text-[11px] uppercase tracking-[0.15em] placeholder:text-gray-300 focus:outline-none focus:border-black transition-colors bg-transparent mb-1"
        />

        {/* Forgot password */}
        <div className="flex justify-end mb-4">
          <Link
            href={`/${locale}/account/forgot-password`}
            className="text-[8px] uppercase tracking-[0.15em] text-gray-300 hover:text-black transition-colors"
          >
            {t('forgot_password')}
          </Link>
        </div>

        {/* Continue button */}
        <button
          type="button"
          className="w-full bg-black text-white py-2.5 text-[11px] uppercase tracking-[0.2em] font-medium hover:opacity-75 transition-opacity mb-5"
        >
          {t('continue')}
        </button>

        {/* Create account link */}
        <div className="text-center">
          <Link
            href={`/${locale}/account/register`}
            className="text-[8px] uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
          >
            {t('create_account')}
          </Link>
        </div>
      </div>
    </div>
  );
}
