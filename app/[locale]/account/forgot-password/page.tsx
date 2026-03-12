'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';

export default function ForgotPasswordPage() {
  const t = useTranslations('account');
  const { locale } = useLocaleContext();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement password reset API call
      console.log('Sending reset email to:', email);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (mountedRef.current) setEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
      if (mountedRef.current) alert(t('error_forgot'));
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="max-w-md mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="space-y-8 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gray-100 border border-gray-200 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-normal uppercase tracking-wide">
              {t('email_sent_title')}
            </h1>
            <p className="text-gray-600 text-sm">
              {t('email_sent_intro')}
            </p>
            <p className="font-medium">{email}</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 text-left">
            <p className="text-sm text-gray-600">
              {t('email_sent_instructions')}
            </p>
          </div>

          <div className="pt-4">
            <Link
              href={`/${locale}/account`}
              className="inline-block w-full bg-black text-white py-3 text-sm uppercase tracking-wide hover:opacity-80 transition-opacity text-center"
            >
              {t('back_to_login')}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="text-sm text-gray-600 hover:text-black transition-colors underline"
          >
            {t('resend')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 md:px-8 py-12 md:py-16">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-normal uppercase tracking-wide">
            {t('forgot_title')}
          </h1>
          <p className="text-gray-600 text-sm">
            {t('forgot_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              placeholder={t('email_placeholder_upper')}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 p-3 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-400 placeholder:uppercase placeholder:tracking-wide"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 text-sm uppercase tracking-wide hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('sending') : t('send_link')}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 uppercase tracking-wide">
              {t('or')}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-center text-sm">
          <p className="text-gray-600">
            {t('remember_password')}{' '}
            <Link
              href={`/${locale}/account`}
              className="underline font-medium text-black hover:opacity-60 transition-opacity"
            >
              {t('sign_in')}
            </Link>
          </p>
          <p className="text-gray-600">
            {t('no_account')}{' '}
            <Link
              href={`/${locale}/account/register`}
              className="underline font-medium text-black hover:opacity-60 transition-opacity"
            >
              {t('create_account')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
