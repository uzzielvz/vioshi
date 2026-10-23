'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { buttonClass, hintClass, inputClass, labelClass } from '@/components/ui/styles';
import { updateProfileAction, type ProfileUpdateState } from '../actions';

function SaveButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass('primary', 'md', 'w-full md:w-auto')}>
      {pending ? busy : idle}
    </button>
  );
}

interface Props {
  email: string;
  initialName: string;
  initialPhone: string;
}

export default function ProfileForm({ email, initialName, initialPhone }: Props) {
  const t = useTranslations('ui.profile');
  const [state, formAction] = useFormState<ProfileUpdateState, FormData>(updateProfileAction, null);

  return (
    <form action={formAction} className="grid gap-3.5">
      <div className="grid gap-1.5">
        <label htmlFor="name" className={labelClass}>
          {t('name')}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialName}
          autoComplete="name"
          required
          className={inputClass}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="phone" className={labelClass}>
          {t('phone')}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={initialPhone}
          autoComplete="tel"
          placeholder="722 123 4567"
          className={inputClass}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="email" className={labelClass}>
          {t('email')}
        </label>
        <input id="email" type="email" value={email} disabled aria-describedby="email-hint" className={inputClass} />
        <p id="email-hint" className={hintClass}>
          {t('email_hint')}
        </p>
      </div>

      {state && 'error' in state && (
        <p role="alert" className="rounded-btn border border-ink px-3 py-2.5 text-[13px] text-ink">
          {state.error}
        </p>
      )}
      {state && 'ok' in state && (
        <p role="status" className="bg-carton p-3 text-[13px] text-ink">
          {t('saved_ok')}
        </p>
      )}

      <SaveButton idle={t('save')} busy={t('saving')} />
    </form>
  );
}
