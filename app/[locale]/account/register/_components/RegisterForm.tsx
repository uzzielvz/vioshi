'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import { buttonClass, hintClass, inputClass, labelClass, textLinkClass } from '@/components/ui/styles';
import { signUpAction, type AuthState } from '../../actions';
import AuthScreen, { FormAlert, GoogleButton, OrDivider } from '../../_components/AuthScreen';

function SubmitButton({ idle, busy, disabled }: { idle: string; busy: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={buttonClass('primary', 'md', 'w-full')}>
      {pending ? busy : idle}
    </button>
  );
}

export default function RegisterForm({ locale }: { locale: Locale }) {
  const t = useTranslations('ui.auth');
  const [state, formAction] = useFormState<AuthState, FormData>(signUpAction, null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const passwordsMatch = !confirm || password === confirm;

  const legalLink = (chunks: React.ReactNode) => (
    <Link href={`/${locale}/pages/legal`} className="text-ink underline underline-offset-2">
      {chunks}
    </Link>
  );

  return (
    <AuthScreen locale={locale} title={t('register_title')} subtitle={t('register_body')} closeLabel={t('close')}>
      <form action={formAction} noValidate className="grid gap-3.5">
        <input type="hidden" name="locale" value={locale} />

        <div className="grid grid-cols-2 gap-2.5">
          <div className="grid gap-1.5">
            <label htmlFor="firstName" className={labelClass}>
              {t('first_name')}
            </label>
            <input id="firstName" name="firstName" type="text" autoComplete="given-name" required className={inputClass} />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="lastName" className={labelClass}>
              {t('last_name')}
            </label>
            <input id="lastName" name="lastName" type="text" autoComplete="family-name" required className={inputClass} />
          </div>
        </div>

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
          <label htmlFor="password" className={labelClass}>
            {t('password')}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-hint"
            className={inputClass}
          />
          <p id="password-hint" className={hintClass}>
            {t('password_hint')}
          </p>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="confirmPassword" className={labelClass}>
            {t('confirm_password')}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={!passwordsMatch}
            className={inputClass}
          />
        </div>

        {!passwordsMatch && <FormAlert>{t('mismatch')}</FormAlert>}
        {state && 'error' in state && <FormAlert>{state.error}</FormAlert>}
        {state && 'success' in state && <FormAlert tone="ok">{state.success}</FormAlert>}

        <SubmitButton idle={t('register')} busy={t('register_busy')} disabled={!passwordsMatch} />
      </form>

      <OrDivider label={t('or')} />
      <GoogleButton locale={locale} label={t('google')} className={buttonClass('line', 'md', 'w-full')} />

      <p className="text-center text-[13.5px] text-ink">
        {t('have_account')}{' '}
        <Link href={`/${locale}/account`} className={textLinkClass}>
          {t('login_link')}
        </Link>
      </p>
      <p className="mt-2 text-center text-[11.5px] text-muted">
        {t.rich('legal', { terms: legalLink, privacy: legalLink })}
      </p>
    </AuthScreen>
  );
}
