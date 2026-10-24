'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import { brand } from '@/lib/brand';
import { buttonClass, inputClass, labelClass, textLinkClass } from '@/components/ui/styles';
import { signInAction, type AuthState } from '../actions';
import AuthScreen, { FormAlert, GoogleButton, OrDivider } from './AuthScreen';

export type LoginNotice = 'oauth' | 'reset_expired';

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass('primary', 'md', 'w-full')}>
      {pending ? busy : idle}
    </button>
  );
}

export default function LoginForm({ locale, notice }: { locale: Locale; notice?: LoginNotice }) {
  const t = useTranslations('ui.auth');
  const [state, formAction] = useFormState<AuthState, FormData>(signInAction, null);

  const legalLink = (chunks: React.ReactNode) => (
    <Link href={`/${locale}/pages/legal`} className="text-ink underline underline-offset-2">
      {chunks}
    </Link>
  );

  return (
    <AuthScreen
      locale={locale}
      title={t('login_title', { brand: brand.name })}
      subtitle={t('login_body')}
      closeLabel={t('close')}
    >
      {notice && <FormAlert>{notice === 'oauth' ? t('error_oauth') : t('error_reset_expired')}</FormAlert>}

      <form action={formAction} noValidate className="grid gap-3.5">
        <input type="hidden" name="locale" value={locale} />

        <div className="grid gap-1.5">
          <label htmlFor="email" className={labelClass}>
            {t('email')}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t('email_placeholder')}
            required
            className={inputClass}
          />
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className={labelClass}>
              {t('password')}
            </label>
            <Link href={`/${locale}/account/forgot-password`} className={`text-[13px] ${textLinkClass}`}>
              {t('forgot')}
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </div>

        {state && 'error' in state && <FormAlert>{state.error}</FormAlert>}

        <SubmitButton idle={t('login')} busy={t('login_busy')} />
      </form>

      <OrDivider label={t('or')} />
      <GoogleButton locale={locale} label={t('google')} className={buttonClass('line', 'md', 'w-full')} />

      <p className="text-center text-[13.5px] text-ink">
        {t('no_account')}{' '}
        <Link href={`/${locale}/account/register`} className={textLinkClass}>
          {t('create_one')}
        </Link>
      </p>
      <p className="mt-2 text-center text-[11.5px] text-muted">
        {t.rich('legal', { terms: legalLink, privacy: legalLink })}
      </p>
    </AuthScreen>
  );
}
