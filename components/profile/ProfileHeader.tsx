import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import Avatar from '@/components/ui/Avatar';
import UnderlineTabs, { type UnderlineTab } from '@/components/ui/UnderlineTabs';
import { sectionLabelClass } from '@/components/ui/styles';

/** An uploaded photo, or a collage of the profile's own pieces until there is one. */
export type ProfileCover = { kind: 'photo'; src: string } | { kind: 'collage'; images: string[] };

export interface ProfileBrand {
  name: string;
  href: string;
}

function Cover({ cover }: { cover: ProfileCover }) {
  if (cover.kind === 'photo') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={cover.src} alt="" className="h-full w-full object-cover" />;
  }

  const images = cover.images.slice(0, 3);
  if (images.length === 0) return null;

  return (
    <div
      className={clsx(
        'grid h-full',
        images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
      )}
    >
      {images.map((src, index) => (
        <div key={`${src}-${index}`} className="relative h-full">
          {/* Product shots have white backgrounds; multiply blends them into the carton. */}
          <Image src={src} alt="" fill className="object-cover mix-blend-multiply" sizes="40vw" priority={index === 0} />
        </div>
      ))}
    </div>
  );
}

// One profile for every account (FROZEN: all accounts are equal). A store and a
// person get the same cover, mounted avatar, numbers, buttons, brands and tabs;
// only what fills each slot changes.
export default function ProfileHeader({
  name,
  avatarSrc,
  avatarTone = 'carton',
  avatarEdit,
  cover,
  coverEdit,
  tools,
  sub,
  stats,
  bio,
  actions,
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
  cover: ProfileCover;
  /** «Cambiar portada» (own profile). */
  coverEdit?: React.ReactNode;
  /** Round icon buttons next to the avatar: share, settings. */
  tools?: React.ReactNode;
  sub?: React.ReactNode;
  stats?: React.ReactNode;
  bio?: string | null;
  actions?: React.ReactNode;
  brandsLabel?: string;
  brands?: ProfileBrand[];
  tabs: UnderlineTab[];
  tabsLabel: string;
}) {
  return (
    <header>
      <div className="relative aspect-[16/7] overflow-hidden bg-carton md:aspect-[4/1]">
        <Cover cover={cover} />
        {coverEdit && <div className="absolute bottom-2.5 right-2.5 md:bottom-4 md:right-4">{coverEdit}</div>}
      </div>

      <div className="grid gap-3 px-4 pb-4 md:px-8 md:pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="relative -mt-[38px] md:-mt-[52px]">
            <Avatar
              name={name}
              src={avatarSrc}
              tone={avatarTone}
              className="h-[76px] w-[76px] border-[3px] border-paper text-[28px] md:h-[104px] md:w-[104px] md:text-[38px]"
            />
            {avatarEdit && <div className="absolute -bottom-0.5 -right-0.5">{avatarEdit}</div>}
          </div>
          {tools && <div className="flex gap-2 pt-2.5">{tools}</div>}
        </div>

        <div className="-mt-1 grid gap-0.5">
          <h1 className="text-[21px] font-bold leading-tight tracking-[-0.015em] text-ink [text-wrap:balance] md:text-[24px]">
            {name}
          </h1>
          {sub && <p className="text-[12.5px] text-muted">{sub}</p>}
        </div>

        {stats && <p className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink">{stats}</p>}
        {bio && <p className="max-w-xl text-[13px] leading-relaxed text-ink">{bio}</p>}
        {actions && <div className="md:max-w-[420px]">{actions}</div>}

        {brands.length > 0 && (
          <div className="grid gap-2 pt-1">
            {brandsLabel && <p className={sectionLabelClass}>{brandsLabel}</p>}
            <ul className="flex flex-wrap gap-1.5">
              {brands.map((brand) => (
                <li key={brand.name}>
                  <Link
                    href={brand.href}
                    className="inline-flex h-8 items-center rounded-btn border border-line px-3 text-[12.5px] font-semibold text-ink transition-colors hover:border-ink"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <UnderlineTabs label={tabsLabel} tabs={tabs} />
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
