'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import { brand } from '@/lib/brand';
import { signUpAction, signInWithGoogleAction, type AuthState } from '../../actions';

const FONT: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

const LOGO: React.CSSProperties = {
  ...FONT,
  textShadow: '0 0 0.5px rgba(0,0,0,0.8)',
};

const INPUT =
  'w-full border-b border-gray-200 py-3 text-[11px] placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent';

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

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white py-3 text-[11px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
    >
      {pending ? busy : idle}
    </button>
  );
}

export default function RegisterForm({ locale }: { locale: Locale }) {
  const t = useTranslations('account');
  const [state, formAction] = useFormState<AuthState, FormData>(signUpAction, null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const passwordsMatch = !confirm || password === confirm;

  return (
    <div className="min-h-screen bg-white pt-16 flex items-start justify-center px-4 py-16 md:py-24" style={FONT}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <span className="text-2xl font-bold uppercase tracking-wider" style={LOGO}>
            {brand.name}
          </span>
          <div className="mt-4">
            <Link
              href={`/${locale}`}
              className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              {t('back_to_store')}
            </Link>
          </div>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-widest mb-1">{t('register_title')}</p>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-8">{t('register_subtitle')}</p>

        <form action={signInWithGoogleAction}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="w-full border border-gray-200 py-3 text-[11px] uppercase tracking-widest hover:border-black transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <GoogleLogo />
            {t('login_with_google')}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-[10px] text-gray-300 uppercase tracking-widest">
              {t('or')}
            </span>
          </div>
        </div>

        <form action={formAction} className="space-y-4" noValidate>
          <input type="hidden" name="locale" value={locale} />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder={t('first_name')}
              required
              autoComplete="given-name"
              className={INPUT}
            />
            <input
              type="text"
              name="lastName"
              placeholder={t('last_name')}
              required
              autoComplete="family-name"
              className={INPUT}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            autoComplete="email"
            className={INPUT}
          />

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT}
            />
            <p className="text-[10px] text-gray-400 mt-1">{t('min_chars')}</p>
          </div>

          <input
            type="password"
            name="confirmPassword"
            placeholder={t('confirm_password')}
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={INPUT}
          />

          {!passwordsMatch && (
            <p className="text-[10px] text-red-500">{t('passwords_mismatch')}</p>
          )}

          {state && 'error' in state && (
            <p className="text-[10px] text-red-500">{state.error}</p>
          )}

          {state && 'success' in state && (
            <p className="text-[10px] text-green-600">{state.success}</p>
          )}

          <SubmitButton idle={t('register_submit')} busy={t('register_submitting')} />
        </form>

        <div className="mt-8 text-center mb-10">
          <Link
            href={`/${locale}/account`}
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            {t('already_account')} {t('sign_in')}
          </Link>
        </div>

        <div className="flex items-center justify-center gap-3 pt-6 border-t border-gray-100">
          <Link
            href="/es/account/register"
            className={`text-[10px] uppercase tracking-widest transition-colors ${locale === 'es' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
          >
            ES / MXN
          </Link>
          <span className="text-gray-200 text-[10px]">|</span>
          <Link
            href="/en/account/register"
            className={`text-[10px] uppercase tracking-widest transition-colors ${locale === 'en' ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
          >
            EN / USD
          </Link>
        </div>
      </div>
    </div>
  );
}
