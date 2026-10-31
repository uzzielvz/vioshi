'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { CameraIcon } from '@/components/ui/icons';
import { buttonClass } from '@/components/ui/styles';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { uploadProfileMediaAction } from '@/lib/profile/actions';
import type { ProfileMediaKind } from '@/lib/profile/media';
import { prepareProfileImage } from '@/lib/profile/prepareImage';

// Picks a photo, shrinks it in the browser and uploads it as the avatar or the
// cover. `overlay` sits on the cover or the avatar; `line` is a regular button.
export default function ProfileMediaButton({
  kind,
  variant,
}: {
  kind: ProfileMediaKind;
  variant: 'overlay' | 'line';
}) {
  const t = useTranslations('ui.profile');
  const router = useRouter();
  const { locale } = useLocaleContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [refreshing, startRefresh] = useTransition();

  // On the cover and the avatar the error replaces the label for a moment.
  useEffect(() => {
    if (!failed || variant !== 'overlay') return;
    const timer = window.setTimeout(() => setFailed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [failed, variant]);

  const label = kind === 'avatar' ? t('change_photo') : t('change_cover');
  const pending = busy || refreshing;

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setBusy(true);
    setFailed(false);
    try {
      const image = await prepareProfileImage(file, kind);
      const form = new FormData();
      form.set('kind', kind);
      form.set('file', image, `${kind}.jpg`);
      const result = await uploadProfileMediaAction(form);
      if (!result.ok) {
        if (result.reason === 'auth') router.push(`/${locale}/account`);
        else setFailed(true);
        return;
      }
      startRefresh(() => router.refresh());
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const text = pending ? t('uploading') : failed ? t('upload_error') : label;

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={onPick} />
      {variant === 'line' ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className={buttonClass('line', 'sm')}
        >
          <CameraIcon className="h-4 w-4" />
          {text}
        </button>
      ) : kind === 'avatar' ? (
        <span className="relative block">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            aria-label={label}
            title={label}
            className={clsx(
              'grid h-6 w-6 place-items-center rounded-full border-2 border-paper bg-ink text-paper md:h-7 md:w-7',
              pending && 'opacity-70'
            )}
          >
            <CameraIcon className="h-3 w-3" />
          </button>
          <span
            role="status"
            className={clsx(
              'absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-btn bg-ink px-2 py-1 text-[11.5px] font-medium text-paper',
              !(pending || failed) && 'sr-only'
            )}
          >
            {pending || failed ? text : ''}
          </span>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="inline-flex h-7 items-center gap-1.5 rounded-btn bg-paper/95 px-2 text-[11.5px] font-semibold text-ink shadow-[0_1px_2px_rgba(0,0,0,0.15)] disabled:opacity-70"
        >
          <CameraIcon className="h-3.5 w-3.5" />
          {text}
        </button>
      )}
    </>
  );
}
