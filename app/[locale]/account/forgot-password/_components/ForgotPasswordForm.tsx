'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import { brand } from '@/lib/brand';
import { resetPasswordAction, type AuthState } from '../../actions';

const FONT: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

const LOGO: React.CSSProperties = {
  ...FONT,
  textShadow: '0 0 0.5px rgba(0,0,0,0.8)',
};

const INPUT =
  'w-full border-b border-gray-200 py-3 text-[11px] placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors bg-transparent';

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black text-white py-3 text-[11px] uppercase tracking-widest font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="min-h-screen bg-white pt-16 flex items-start justify-center px-4 py-16 md:py-24" style={FONT}>
        <div className="w-full max-w-sm text-center">
          <span className="text-2xl font-bold uppercase tracking-wider" style={LOGO}>
            {brand.name}
          </span>

          <p className="text-[11px] font-semibold uppercase tracking-widest mt-10 mb-2">
            {t('email_sent_title')}
          </p>
          <p className="text-[11px] text-gray-400 mb-8 leading-relaxed">
            {t('email_sent_instructions')}
          </p>

          <Link
            href={`/${locale}/account`}
            className="inline-block w-full bg-black text-white py-3 text-[11px] uppercase tracking-widest hover:opacity-80 transition-opacity text-center"
          >
            {t('back_to_login')}
          </Link>
        </div>
      </div>
    );
  }

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

        <p className="text-[11px] font-semibold uppercase tracking-widest mb-1">
          {t('forgot_title')}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-8">
          {t('forgot_subtitle')}
        </p>

        <form action={formAction} className="space-y-6" noValidate>
          <input type="hidden" name="locale" value={locale} />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            autoComplete="email"
            className={INPUT}
          />

          {state && 'error' in state && (
            <p className="text-[10px] text-red-500">{state.error}</p>
          )}

          <SubmitButton idle={t('send_link')} busy={t('sending')} />
        </form>

        <div className="mt-8 text-center space-y-2">
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
