import Link from 'next/link';
import clsx from 'clsx';
import Avatar from '@/components/ui/Avatar';

export interface ProfileBrand {
  name: string;
  href: string;
}

export interface ProfileTab {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}

// Profile tabs are pills (the human's call after Grailed, 2026-10-31). The
// rest of the app keeps the underlined tabs.
function ProfileTabs({ tabs, label }: { tabs: ProfileTab[]; label: string }) {
  return (
    <nav
      aria-label={label}
      className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:px-8 [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          aria-current={tab.active ? 'page' : undefined}
          className={clsx(
            'inline-flex h-8 flex-none items-center gap-1.5 rounded-full px-3.5 text-[11.5px] font-semibold uppercase tracking-[0.05em] transition-colors',
            tab.active ? 'bg-ink text-paper' : 'bg-carton text-ink hover:bg-line'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx('tabular-nums', tab.active ? 'text-paper/70' : 'text-muted')}>{tab.count}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}

// One profile for every account (FROZEN: all accounts are equal). A store and a
// person get the same cover, identity row, numbers, brands and tabs; only what
// fills each slot changes. Without an uploaded cover the band stays gray.
// Kept compact on purpose: the pieces below are what the profile is for.
export default function ProfileHeader({
  name,
  avatarSrc,
  avatarTone = 'carton',
  avatarEdit,
  coverSrc,
  coverEdit,
  tools,
  sub,
  stats,
  action,
  meta,
  bio,
  brandsLabel,
  brands = [],
  tabs,
  tabsLabel,
}: {
  name: string;
  avatarSrc?: string | null;
  avatarTone?: 'carton' | 'ink';
  /** Small button on the avatar to change it (own profile). */
  avatarEdit?: React.ReactNode;
  coverSrc?: string | null;
  /** «Cambiar portada» (own profile). */
  coverEdit?: React.ReactNode;
  /** Round icon buttons at the end of the identity row: share, Instagram, settings. */
  tools?: React.ReactNode;
  /** Under the name: the handle. */
  sub?: React.ReactNode;
  /** <ProfileStat> items: label on top, number below. */
  stats?: React.ReactNode;
  /** The one button next to the numbers: «Editar perfil» or «Seguir». */
  action?: React.ReactNode;
  /** «Se unió en…». */
  meta?: React.ReactNode;
  bio?: string | null;
  brandsLabel?: string;
  brands?: ProfileBrand[];
  tabs: ProfileTab[];
  tabsLabel: string;
}) {
  return (
    <header className="pb-1">
      <div className="relative aspect-[3/1] overflow-hidden bg-carton md:aspect-[5/1]">
        {coverSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverSrc} alt="" className="h-full w-full object-cover" />
        )}
        {coverEdit && <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3">{coverEdit}</div>}
      </div>

      <div className="grid gap-3 px-4 pb-4 md:px-8">
        <div className="flex items-end gap-3 md:gap-4">
          <div className="relative -mt-8 flex-none md:-mt-11">
            <Avatar
              name={name}
              src={avatarSrc}
              tone={avatarTone}
              className="h-16 w-16 border-[3px] border-paper text-[24px] md:h-[88px] md:w-[88px] md:text-[32px]"
            />
            {avatarEdit && <div className="absolute -bottom-0.5 -right-0.5">{avatarEdit}</div>}
          </div>
          <div className="min-w-0 flex-1 pb-0.5">
            <h1 className="truncate text-[17px] font-bold leading-tight tracking-[-0.01em] text-ink md:text-[20px]">
              {name}
            </h1>
            {sub && <p className="truncate text-[12.5px] text-muted">{sub}</p>}
          </div>
          {tools && <div className="flex flex-none gap-1.5 pb-0.5">{tools}</div>}
        </div>

        {(stats || action) && (
          <div className="flex items-center justify-between gap-4 md:max-w-[520px]">
            {stats && <dl className="flex min-w-0 gap-4">{stats}</dl>}
            {action && <div className="flex-none">{action}</div>}
          </div>
        )}

        {(meta || bio) && (
          <div className="grid gap-1">
            {bio && <p className="max-w-xl text-[13px] leading-relaxed text-ink">{bio}</p>}
            {meta && <p className="text-[12px] text-muted">{meta}</p>}
          </div>
        )}

        {brands.length > 0 && (
          <div className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
            {brandsLabel && <p className="mr-1 flex-none text-[12px] text-muted">{brandsLabel}</p>}
            <ul className="contents">
              {brands.map((brand) => (
                <li key={brand.name} className="flex-none">
                  <Link
                    href={brand.href}
                    className="inline-flex h-6 flex-none items-center whitespace-nowrap rounded-btn border border-line px-2 text-[10.5px] font-semibold uppercase tracking-[0.05em] text-ink transition-colors hover:border-ink"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <ProfileTabs tabs={tabs} label={tabsLabel} />
    </header>
  );
}
