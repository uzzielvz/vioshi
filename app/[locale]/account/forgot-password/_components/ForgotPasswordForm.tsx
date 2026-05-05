'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import { resetPasswordAction, type AuthState } from '../../actions';

const FONT: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

const LOGO: React.CSSProperties = {
  ...FONT,
  textShadow: '0 0 0.5px rgba(0,0,0,0.8)',
};

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white py-3 text-sm uppercase tracking-wide hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? busy : idle}
    </button>
  );
}

export default function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const t = useTranslations('account');
  const [state, formAction] = useFormState<AuthState, FormData>(resetPasswordAction, null);

  const isSent = state && 'success' in state;

  if (isSent) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
        <div className="bg-gray-50 w-full max-w-sm px-8 py-10 text-center" style={FONT}>
          <div className="text-center mb-3">
            <span className="text-lg font-bold" style={LOGO}>VIOGI</span>
          </div>

          <div className="flex justify-center mt-6 mb-6">
            <div className="w-14 h-14 bg-white border border-gray-200 flex items-center justify-center">
              <svg className="w-7 h-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-wide mb-2">
            {t('email_sent_title')}
          </p>
          <p className="text-[10px] text-gray-500 mb-6 leading-relaxed">
            {t('email_sent_instructions')}
          </p>

          <Link
            href={`/${locale}/account`}
            className="inline-block w-full bg-black text-white py-2.5 text-[11px] uppercase tracking-wide hover:opacity-80 transition-opacity text-center"
          >
            {t('back_to_login')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="bg-gray-50 w-full max-w-sm px-8 py-10" style={FONT}>
        <div className="text-center mb-3">
          <span className="text-lg font-bold" style={LOGO}>VIOGI</span>
        </div>

        <div className="text-center mb-5">
          <Link
            href={`/${locale}`}
            className="text-[10px] uppercase tracking-widest text-gray-300 hover:text-black transition-colors"
          >
            {t('back_to_store')}
          </Link>
        </div>

        <p className="text-[11px] font-semibold uppercase tracking-wide mb-0.5">
          {t('forgot_title')}
        </p>
        <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-5">
          {t('forgot_subtitle')}
        </p>

        <form action={formAction} className="space-y-4" noValidate>
          <input type="hidden" name="locale" value={locale} />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            autoComplete="email"
            className="w-full border border-gray-300 px-3 py-2.5 text-[11px] placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent"
          />

          {state && 'error' in state && (
            <p className="text-[10px] text-red-500">{state.error}</p>
          )}

          <SubmitButton idle={t('send_link')} busy={t('sending')} />
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-[10px] text-gray-400">
            {t('remember_password')}{' '}
            <Link href={`/${locale}/account`} className="text-black hover:opacity-60 transition-opacity">
              {t('sign_in')}
            </Link>
          </p>
          <p className="text-[10px] text-gray-400">
            {t('no_account')}{' '}
            <Link href={`/${locale}/account/register`} className="text-black hover:opacity-60 transition-opacity">
              {t('create_account')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
