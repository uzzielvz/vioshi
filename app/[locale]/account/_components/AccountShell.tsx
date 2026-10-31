import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n';
import { getProducts } from '@/lib/products';
import { getPersonProfile } from '@/lib/profile/person';
import ProfileHeader, { topBrands } from '@/components/profile/ProfileHeader';
import ProfileMediaButton from '@/components/profile/ProfileMediaButton';
import { ProfileStat } from '@/components/profile/ProfileStat';
import { GearIcon } from '@/components/ui/icons';
import { buttonClass, iconButtonClass } from '@/components/ui/styles';
import { getAccountDisplayName } from './accountDisplayName';

export type AccountTab = 'saved' | 'purchases' | 'following';

// A person's profile («Tu perfil» in the prototype). It is the same profile a
// store has (ProfileHeader); selling is an extra step, from «Vender» in the nav.
export default async function AccountShell({
  locale,
  user,
  active,
  children,
}: {
  locale: Locale;
  user: User;
  active: AccountTab;
  children: React.ReactNode;
}) {
  const [person, t] = await Promise.all([getPersonProfile(user), getTranslations('ui.profile')]);
  const displayName = getAccountDisplayName(user, person.name);

  // Saved pieces give the brand chips.
  const savedIds = new Set(person.savedIds);
  const saved = savedIds.size > 0 ? (await getProducts()).filter((p) => savedIds.has(p.id)) : [];

  const joined = new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(user.created_at));

  const tabs = [
    { key: 'saved', href: `/${locale}/account`, label: t('saved') },
    { key: 'purchases', href: `/${locale}/account/orders`, label: t('purchases') },
    { key: 'following', href: `/${locale}/account/following`, label: t('following') },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-[1280px] pb-10">
      <ProfileHeader
        name={displayName}
        avatarSrc={person.avatarUrl}
        coverSrc={person.coverUrl}
        coverEdit={person.mediaReady ? <ProfileMediaButton kind="cover" variant="overlay" /> : undefined}
        avatarEdit={person.mediaReady ? <ProfileMediaButton kind="avatar" variant="overlay" /> : undefined}
        tools={
          <Link href={`/${locale}/account/profile`} aria-label={t('settings')} title={t('settings')} className={iconButtonClass}>
            <GearIcon className="h-[18px] w-[18px]" />
          </Link>
        }
        stats={
          <>
            {person.followingCount !== null && <ProfileStat label={t('stat_following')} value={person.followingCount} />}
            <ProfileStat label={t('stat_purchases')} value={person.purchasesCount} />
          </>
        }
        action={
          <Link href={`/${locale}/account/profile`} className={buttonClass('line', 'sm')}>
            {t('edit')}
          </Link>
        }
        meta={t('joined', { date: joined })}
        brandsLabel={t('brands_saved')}
        brands={topBrands(saved.map((p) => p.brand?.name)).map((name) => ({
          name,
          href: `/${locale}/search?brand=${encodeURIComponent(name)}`,
        }))}
        tabsLabel={t('tabs_label')}
        tabs={tabs.map((tab) => ({ href: tab.href, label: tab.label, active: tab.key === active }))}
      />

      <div className="pt-4 md:px-8">{children}</div>
    </div>
  );
}
