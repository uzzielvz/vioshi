'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { buttonClass } from '@/components/ui/styles';
import { resetPasswordAction, type AuthState } from '../../actions';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass('line', 'sm')}>
      {label}
    </button>
  );
}

// Changing the password goes through the same email link as «¿La olvidaste?».
export default function PasswordLinkForm({ locale, email }: { locale: string; email: string }) {
  const t = useTranslations('ui.profile');
  const [state, formAction] = useFormState<AuthState, FormData>(resetPasswordAction, null);

  if (state && 'success' in state) {
    return (
      <p role="status" className="bg-carton p-3 text-[13px] text-ink">
        {t('password_sent')}
      </p>
    );
  }

  return (
    <form action={formAction} className="grid justify-items-start gap-3">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="email" value={email} />
      <p className="text-[13.5px] text-muted">{t('password_body', { email })}</p>
      {state && 'error' in state && (
        <p role="alert" className="rounded-btn border border-ink px-3 py-2.5 text-[13px] text-ink">
          {state.error}
        </p>
      )}
      <SubmitButton label={t('password_cta')} />
    </form>
  );
}
