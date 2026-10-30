import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n';
import { getProducts } from '@/lib/products';
import { getPersonProfile } from '@/lib/profile/person';
import ProfileHeader, { topBrands, type ProfileCover } from '@/components/profile/ProfileHeader';
import ProfileMediaButton from '@/components/profile/ProfileMediaButton';
import { boldStat, ProfileStat } from '@/components/profile/ProfileStat';
import { GearIcon } from '@/components/ui/icons';
import { buttonClass, iconButtonClass } from '@/components/ui/styles';
import { getAccountDisplayName } from './accountDisplayName';

export type AccountTab = 'saved' | 'purchases' | 'following';

// A person's profile («Tu perfil» in the prototype). It is the same profile a
// store has (ProfileHeader); selling is an extra step reached from here.
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

  // Saved pieces give the brand chips and, until a photo is uploaded, the cover.
  const savedIds = new Set(person.savedIds);
  const saved = savedIds.size > 0 ? (await getProducts()).filter((p) => savedIds.has(p.id)) : [];
  const cover: ProfileCover = person.coverUrl
    ? { kind: 'photo', src: person.coverUrl }
    : { kind: 'collage', images: saved.map((p) => p.image).filter(Boolean) };

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
        cover={cover}
        coverEdit={person.mediaReady ? <ProfileMediaButton kind="cover" variant="overlay" /> : undefined}
        avatarEdit={person.mediaReady ? <ProfileMediaButton kind="avatar" variant="overlay" /> : undefined}
        tools={
          <Link href={`/${locale}/account/profile`} aria-label={t('settings')} title={t('settings')} className={iconButtonClass}>
            <GearIcon className="h-[18px] w-[18px]" />
          </Link>
        }
        sub={t('joined', { date: joined })}
        stats={
          <>
            {person.followingCount !== null && (
              <ProfileStat>{t.rich('stat_following', { count: person.followingCount, b: boldStat })}</ProfileStat>
            )}
            <ProfileStat>{t.rich('stat_purchases', { count: person.purchasesCount, b: boldStat })}</ProfileStat>
          </>
        }
        actions={
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/${locale}/account/profile`} className={buttonClass('line', 'sm')}>
              {t('edit')}
            </Link>
            <Link href={`/${locale}/vender`} className={buttonClass('soft', 'sm')}>
              {t('start_selling')}
            </Link>
          </div>
        }
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
