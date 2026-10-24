import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getProducts } from '@/lib/products';
import type { Locale } from '@/i18n';
import FollowButton from '@/components/FollowButton';
import Avatar from '@/components/ui/Avatar';
import EmptyState from '@/components/ui/EmptyState';
import UnderlineTabs from '@/components/ui/UnderlineTabs';
import { UserIcon } from '@/components/ui/icons';
import { buttonClass } from '@/components/ui/styles';
import AccountShell from '../_components/AccountShell';

type Filter = 'all' | 'stores' | 'brands';

interface FollowRow {
  id: string;
  store_id: string | null;
  brand_id: string | null;
  stores: { id: string; slug: string; name: string; logo_url: string | null } | null;
  brands: { id: string; slug: string; name: string; logo_url: string | null } | null;
}

export default async function FollowingPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { type?: string };
}) {
  const locale = params.locale as Locale;
  const filter: Filter = searchParams.type === 'stores' || searchParams.type === 'brands' ? searchParams.type : 'all';

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/account`);

  const [{ data: profile }, followsRes, products, t] = await Promise.all([
    supabase.from('profiles').select('name').eq('id', user.id).maybeSingle(),
    supabase
      .from('follows')
      .select('id, store_id, brand_id, stores (id, slug, name, logo_url), brands (id, slug, name, logo_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    getProducts(),
    getTranslations('ui.social'),
  ]);

  // Missing table (migration not applied yet) reads as an error, not as "nothing".
  const unavailable = Boolean(followsRes.error);
  const follows = ((followsRes.data ?? []) as unknown as FollowRow[]).filter((f) => f.stores || f.brands);

  const piecesByStore = new Map<string, number>();
  const piecesByBrand = new Map<string, number>();
  for (const p of products) {
    if (p.availability === 'vendida') continue;
    if (p.store?.id) piecesByStore.set(p.store.id, (piecesByStore.get(p.store.id) ?? 0) + 1);
    if (p.brand?.id) piecesByBrand.set(p.brand.id, (piecesByBrand.get(p.brand.id) ?? 0) + 1);
  }

  const rows = follows
    .map((f) =>
      f.stores
        ? {
            key: f.id,
            kind: 'store' as const,
            id: f.stores.id,
            name: f.stores.name,
            logo: f.stores.logo_url,
            href: `/${locale}/tienda/${f.stores.slug}`,
            pieces: piecesByStore.get(f.stores.id) ?? 0,
          }
        : {
            key: f.id,
            kind: 'brand' as const,
            id: f.brands!.id,
            name: f.brands!.name,
            logo: f.brands!.logo_url,
            href: `/${locale}/search?brand=${encodeURIComponent(f.brands!.name)}`,
            pieces: piecesByBrand.get(f.brands!.id) ?? 0,
          }
    )
    .filter((row) => filter === 'all' || (filter === 'stores' ? row.kind === 'store' : row.kind === 'brand'));

  const base = `/${locale}/account/following`;

  return (
    <AccountShell locale={locale} user={user} profileName={profile?.name ?? null} active="following">
      {unavailable ? (
        <EmptyState icon={<UserIcon />} title={t('unavailable_title')} body={t('unavailable_body')} />
      ) : follows.length === 0 ? (
        <EmptyState icon={<UserIcon />} title={t('empty_title')} body={t('empty_body')}>
          <Link href={`/${locale}`} className={buttonClass('primary')}>
            {t('empty_cta')}
          </Link>
        </EmptyState>
      ) : (
        <div className="md:max-w-[720px]">
          <UnderlineTabs
            label={t('tabs_label')}
            inset
            tabs={[
              { href: base, label: t('tab_all'), active: filter === 'all' },
              { href: `${base}?type=stores`, label: t('tab_stores'), active: filter === 'stores' },
              { href: `${base}?type=brands`, label: t('tab_brands'), active: filter === 'brands' },
            ]}
          />
          <ul className="divide-y divide-line border-y border-line">
            {rows.map((row) => (
              <li key={row.key} className="flex items-center gap-3 px-4 py-3 md:px-0">
                <Link href={row.href} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar
                    name={row.name}
                    src={row.logo}
                    tone={row.kind === 'store' ? 'ink' : 'carton'}
                    className="h-11 w-11 text-[17px]"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold text-ink">{row.name}</span>
                    <span className="block text-[12.5px] text-muted">
                      {row.kind === 'store' ? t('kind_store') : t('kind_brand')} · {t('pieces', { count: row.pieces })}
                    </span>
                  </span>
                </Link>
                <FollowButton kind={row.kind} id={row.id} name={row.name} initialFollowing />
              </li>
            ))}
          </ul>
        </div>
      )}
    </AccountShell>
  );
}
