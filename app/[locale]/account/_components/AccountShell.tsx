import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n';
import { brand } from '@/lib/brand';
import Avatar from '@/components/ui/Avatar';
import UnderlineTabs from '@/components/ui/UnderlineTabs';
import { buttonClass } from '@/components/ui/styles';
import { getAccountDisplayName } from './accountDisplayName';

export type AccountTab = 'saved' | 'purchases' | 'following' | 'addresses';

// A person's profile («Tu perfil» in the prototype). Every account is the
// same kind of profile; selling is an extra step reached from here.
export default async function AccountShell({
  locale,
  user,
  profileName,
  active,
  children,
}: {
  locale: Locale;
  user: User;
  profileName: string | null;
  active: AccountTab;
  children: React.ReactNode;
}) {
  const t = await getTranslations('ui.profile');
  const displayName = getAccountDisplayName(user, profileName);
  const since = new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(user.created_at));

  const tabs = [
    { key: 'saved', href: `/${locale}/account`, label: t('saved') },
    { key: 'purchases', href: `/${locale}/account/orders`, label: t('purchases') },
    { key: 'following', href: `/${locale}/account/following`, label: t('following') },
    { key: 'addresses', href: `/${locale}/account/addresses`, label: t('addresses') },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-[1280px] pb-10">
      <section className="grid gap-3 px-4 pb-4 pt-5 md:px-8 md:pt-8">
        <div className="flex items-center gap-3.5">
          <Avatar name={displayName} className="h-[72px] w-[72px] text-[28px]" />
          <div className="min-w-0">
            <h1 className="truncate text-[20px] font-bold tracking-[-0.01em] text-ink">{displayName}</h1>
            <p className="truncate text-[12.5px] text-muted">{user.email}</p>
            <p className="text-[12.5px] text-muted">{t('since', { brand: brand.name, date: since })}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:max-w-[420px]">
          <Link href={`/${locale}/account/profile`} className={buttonClass('line', 'sm')}>
            {t('edit')}
          </Link>
          <Link href={`/${locale}/vender`} className={buttonClass('soft', 'sm')}>
            {t('start_selling')}
          </Link>
        </div>
      </section>

      <UnderlineTabs
        label={t('tabs_label')}
        tabs={tabs.map((tab) => ({ href: tab.href, label: tab.label, active: tab.key === active }))}
      />

      <div className="pt-4 md:px-8">{children}</div>
    </div>
  );
}
