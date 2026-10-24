'use client';

import Link from 'next/link';
import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n';
import { buttonClass, inputClass, labelClass, textLinkClass } from '@/components/ui/styles';
import { resetPasswordAction, type AuthState } from '../../actions';
import AuthScreen, { FormAlert } from '../../_components/AuthScreen';

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass('primary', 'md', 'w-full')}>
      {pending ? busy : idle}
    </button>
  );
}

export default function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const t = useTranslations('ui.auth');
  const [state, formAction] = useFormState<AuthState, FormData>(resetPasswordAction, null);

  if (state && 'success' in state) {
    return (
      <AuthScreen locale={locale} title={t('sent_title')} subtitle={t('sent_body')} closeLabel={t('close')}>
        <Link href={`/${locale}/account`} className={buttonClass('line', 'md', 'w-full')}>
          {t('back_to_login')}
        </Link>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen locale={locale} title={t('forgot_title')} subtitle={t('forgot_body')} closeLabel={t('close')}>
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

        {state && 'error' in state && <FormAlert>{state.error}</FormAlert>}

        <SubmitButton idle={t('send_link')} busy={t('sending')} />
      </form>

      <p className="text-center text-[13.5px] text-ink">
        {t('remembered')}{' '}
        <Link href={`/${locale}/account`} className={textLinkClass}>
          {t('login_link')}
        </Link>
      </p>
    </AuthScreen>
  );
}
