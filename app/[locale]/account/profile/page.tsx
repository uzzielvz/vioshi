import Link from 'next/link';
import clsx from 'clsx';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import ProfileMediaButton from '@/components/profile/ProfileMediaButton';
import Avatar from '@/components/ui/Avatar';
import { ChevronIcon } from '@/components/ui/icons';
import { buttonClass, hintClass, sectionLabelClass } from '@/components/ui/styles';
import AccountSubpage from '../_components/AccountSubpage';
import { getAccountDisplayName } from '../_components/accountDisplayName';
import { signOutAction } from '../actions';
import ProfileForm from './_components/ProfileForm';
import PasswordLinkForm from './_components/PasswordLinkForm';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/account`);
  }

  const [withMedia, t, tNav] = await Promise.all([
    supabase.from('profiles').select('name, phone, avatar_url, cover_url').eq('id', user.id).maybeSingle(),
    getTranslations('ui.profile'),
    getTranslations('ui.nav'),
  ]);

  // Without migration 0026 the photo columns do not exist yet.
  const mediaReady = !withMedia.error;
  const profile = (
    mediaReady ? withMedia.data : (await supabase.from('profiles').select('name, phone').eq('id', user.id).maybeSingle()).data
  ) as { name: string | null; phone: string | null; avatar_url?: string | null; cover_url?: string | null } | null;

  const section = 'grid gap-3 border-t border-line pt-5';

  return (
    <AccountSubpage backHref={`/${locale}/account`} backLabel={t('back')} title={t('edit_title')}>
      <div className="grid gap-7">
        {mediaReady && (
          <section className="grid gap-3">
            <h2 className={sectionLabelClass}>{t('media_title')}</h2>
            <div className="flex items-center gap-3.5">
              <Avatar
                name={getAccountDisplayName(user, profile?.name ?? null)}
                src={profile?.avatar_url}
                className="h-14 w-14 text-[22px]"
              />
              <div className="grid flex-1 gap-2 sm:flex sm:flex-none">
                <ProfileMediaButton kind="avatar" variant="line" />
                <ProfileMediaButton kind="cover" variant="line" />
              </div>
            </div>
            <p className={hintClass}>{t('media_hint')}</p>
          </section>
        )}

        <section className={mediaReady ? section : 'grid gap-3'}>
          <h2 className={sectionLabelClass}>{t('details_title')}</h2>
          <ProfileForm
            email={user.email ?? ''}
            initialName={profile?.name ?? ''}
            initialPhone={profile?.phone ?? ''}
          />
        </section>

        <section className={section}>
          <h2 className={sectionLabelClass}>{t('addresses')}</h2>
          <Link
            href={`/${locale}/account/addresses`}
            className="flex items-center justify-between gap-3 rounded-btn border border-line px-4 py-3 text-[14px] text-ink transition-colors hover:border-ink md:max-w-[420px]"
          >
            <span className="grid gap-0.5">
              <span className="font-semibold">{t('addresses_cta')}</span>
              <span className="text-[12.5px] text-muted">{t('addresses_body')}</span>
            </span>
            <ChevronIcon className="h-4 w-4 flex-none text-muted" />
          </Link>
        </section>

        <section className={section}>
          <h2 className={sectionLabelClass}>{t('password_title')}</h2>
          <PasswordLinkForm locale={locale} email={user.email ?? ''} />
        </section>

        <section className={section}>
          <h2 className={sectionLabelClass}>{t('language_title')}</h2>
          {/* Plain links reload the page, which next-intl needs to switch locale cleanly. */}
          <div className="grid grid-cols-2 gap-2 md:max-w-[360px]">
            {(['es', 'en'] as const).map((l) => (
              <a
                key={l}
                href={`/${l}/account/profile`}
                aria-current={locale === l ? 'true' : undefined}
                className={clsx(
                  'grid h-11 place-items-center rounded-btn border text-[14px]',
                  locale === l ? 'border-ink font-semibold text-ink' : 'border-line text-muted'
                )}
              >
                {l === 'es' ? tNav('lang_es') : tNav('lang_en')}
              </a>
            ))}
          </div>
        </section>

        <section className={section}>
          <h2 className={sectionLabelClass}>{t('session_title')}</h2>
          <div className="flex flex-wrap gap-2">
            <Link href={`/${locale}/vender`} className={buttonClass('soft', 'sm')}>
              {t('start_selling')}
            </Link>
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button type="submit" className={buttonClass('line', 'sm')}>
                {t('sign_out')}
              </button>
            </form>
          </div>
        </section>
      </div>
    </AccountSubpage>
  );
}
