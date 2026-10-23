import Link from 'next/link';
import clsx from 'clsx';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import type { Locale } from '@/i18n';
import { buttonClass, sectionLabelClass } from '@/components/ui/styles';
import AccountSubpage from '../_components/AccountSubpage';
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

  const [{ data: profile }, t, tNav] = await Promise.all([
    supabase.from('profiles').select('name, phone').eq('id', user.id).maybeSingle(),
    getTranslations('ui.profile'),
    getTranslations('ui.nav'),
  ]);

  const section = 'grid gap-3 border-t border-line pt-5';

  return (
    <AccountSubpage backHref={`/${locale}/account`} backLabel={t('back')} title={t('edit_title')}>
      <div className="grid gap-7">
        <section className="grid gap-3">
          <h2 className={sectionLabelClass}>{t('details_title')}</h2>
          <ProfileForm
            email={user.email ?? ''}
            initialName={profile?.name ?? ''}
            initialPhone={profile?.phone ?? ''}
          />
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
