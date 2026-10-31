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
            'inline-flex h-9 flex-none items-center gap-1.5 rounded-full px-4 text-[12px] font-bold uppercase tracking-[0.06em] transition-colors',
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
      <div className="relative aspect-[16/7] overflow-hidden bg-carton md:aspect-[4/1]">
        {coverSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverSrc} alt="" className="h-full w-full object-cover" />
        )}
        {coverEdit && <div className="absolute bottom-2.5 right-2.5 md:bottom-4 md:right-4">{coverEdit}</div>}
      </div>

      <div className="grid gap-4 px-4 pb-5 md:px-8">
        <div className="flex items-end gap-3 md:gap-4">
          <div className="relative -mt-9 flex-none md:-mt-[52px]">
            <Avatar
              name={name}
              src={avatarSrc}
              tone={avatarTone}
              className="h-[76px] w-[76px] border-[3px] border-paper text-[28px] md:h-[104px] md:w-[104px] md:text-[38px]"
            />
            {avatarEdit && <div className="absolute -bottom-0.5 -right-0.5">{avatarEdit}</div>}
          </div>
          <div className="min-w-0 flex-1 pb-0.5">
            <h1 className="truncate text-[20px] font-bold leading-tight tracking-[-0.015em] text-ink md:text-[24px]">
              {name}
            </h1>
            {sub && <p className="truncate text-[13px] text-muted">{sub}</p>}
          </div>
          {tools && <div className="flex flex-none gap-2 pb-1">{tools}</div>}
        </div>

        {(stats || action) && (
          <div className="flex items-center justify-between gap-4 md:max-w-[560px]">
            {stats && <dl className="flex min-w-0 gap-5">{stats}</dl>}
            {action && <div className="flex-none">{action}</div>}
          </div>
        )}

        {(meta || bio) && (
          <div className="grid gap-1.5">
            {meta && <p className="text-[13.5px] text-ink">{meta}</p>}
            {bio && <p className="max-w-xl text-[13.5px] leading-relaxed text-ink">{bio}</p>}
          </div>
        )}

        {brands.length > 0 && (
          <div className="grid gap-2">
            {brandsLabel && <p className="text-[13px] text-ink">{brandsLabel}</p>}
            <ul className="flex flex-wrap gap-1.5">
              {brands.map((brand) => (
                <li key={brand.name}>
                  <Link
                    href={brand.href}
                    className="inline-flex h-9 items-center rounded-btn border border-line px-3 text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition-colors hover:border-ink"
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

/** Most frequent brands first (ties alphabetical), for the brand chips. */
export function topBrands(names: (string | null | undefined)[], limit = 5): string[] {
  const counts = new Map<string, number>();
  for (const name of names) if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => name);
}
