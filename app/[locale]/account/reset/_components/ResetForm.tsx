'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import { buttonClass, hintClass, inputClass, labelClass } from '@/components/ui/styles';
import { updatePasswordAction, type AuthState } from '../../actions';
import AuthScreen, { FormAlert } from '../../_components/AuthScreen';

function SubmitButton({ idle, busy, disabled }: { idle: string; busy: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={buttonClass('primary', 'md', 'w-full')}>
      {pending ? busy : idle}
    </button>
  );
}

export default function ResetForm({ locale, email }: { locale: Locale; email: string }) {
  const t = useTranslations('ui.auth');
  const [state, formAction] = useFormState<AuthState, FormData>(updatePasswordAction, null);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const passwordsMatch = !confirm || password === confirm;

  return (
    <AuthScreen
      locale={locale}
      title={t('reset_title')}
      subtitle={t('reset_body', { email })}
      closeLabel={t('close')}
    >
      <form action={formAction} noValidate className="grid gap-3.5">
        <input type="hidden" name="locale" value={locale} />

        <div className="grid gap-1.5">
          <label htmlFor="password" className={labelClass}>
            {t('new_password')}
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

        <SubmitButton idle={t('save_password')} busy={t('saving')} disabled={!passwordsMatch} />
      </form>
    </AuthScreen>
  );
}
