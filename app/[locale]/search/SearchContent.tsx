'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import ProductGrid from '@/components/ProductGrid';
import SearchFilterDrawer, {
  DEFAULT_FILTERS,
  type SearchFilters,
  type SortKey,
} from '@/components/SearchFilterDrawer';
import EmptyState from '@/components/ui/EmptyState';
import { ChevronIcon, SearchIcon } from '@/components/ui/icons';
import { buttonClass, screenTitleClass } from '@/components/ui/styles';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { STORE_CATEGORIES, type StoreCategory } from '@/lib/categories';
import type { ProductData } from '@/lib/products';

const SORT_KEYS: SortKey[] = ['newest', 'price_asc', 'price_desc'];

function isSortKey(v: string | null): v is SortKey {
  return !!v && (SORT_KEYS as string[]).includes(v);
}

function isCategory(v: string): v is StoreCategory {
  return (STORE_CATEGORIES as readonly string[]).includes(v);
}

function matchesQuery(p: ProductData, q: string) {
  return (
    p.name.toLowerCase().includes(q) ||
    (p.brand?.name.toLowerCase().includes(q) ?? false) ||
    (p.description?.toLowerCase().includes(q) ?? false) ||
    (p.category?.toLowerCase().includes(q) ?? false)
  );
}

export default function SearchContent({ initialProducts }: { initialProducts: ProductData[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useLocaleContext();
  const t = useTranslations('ui.search');
  const tNav = useTranslations('ui.nav');
  const tCats = useTranslations('ui.cats');

  const query = (searchParams.get('q') ?? '').trim();
  const sortParam = searchParams.get('sort');
  const filters: SearchFilters = {
    sort: isSortKey(sortParam) ? sortParam : 'newest',
    category: searchParams.get('category') ?? 'all',
    size: searchParams.get('size') ?? '',
    brand: searchParams.get('brand') ?? '',
  };

  const [draft, setDraft] = useState(query);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => setDraft(query), [query]);

  const matching = useMemo(() => {
    const q = query.toLowerCase();
    return q ? initialProducts.filter((p) => matchesQuery(p, q)) : initialProducts;
  }, [initialProducts, query]);

  // Size and brand options come from what the query already matched.
  const sizes = useMemo(
    () => Array.from(new Set(matching.map((p) => p.size).filter((s): s is string => Boolean(s)))).sort(),
    [matching]
  );
  const brands = useMemo(
    () =>
      Array.from(new Set(matching.map((p) => p.brand?.name).filter((b): b is string => Boolean(b)))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [matching]
  );

  const products = useMemo(() => {
    let list = matching;
    if (filters.category !== 'all') list = list.filter((p) => p.category === filters.category);
    if (filters.size) list = list.filter((p) => p.size === filters.size);
    if (filters.brand) list = list.filter((p) => p.brand?.name === filters.brand);

    const sorted = [...list];
    if (filters.sort === 'price_asc') sorted.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price_desc') sorted.sort((a, b) => b.price - a.price);
    // 'newest': getProducts() already returns created_at desc.
    return sorted;
  }, [matching, filters.category, filters.size, filters.brand, filters.sort]);

  function replaceParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function updateFilters(next: Partial<SearchFilters>) {
    replaceParams((params) => {
      for (const [key, value] of Object.entries(next)) {
        const isDefault = value === DEFAULT_FILTERS[key as keyof SearchFilters];
        if (isDefault || !value) params.delete(key);
        else params.set(key, value);
      }
    });
  }

  function submitQuery(e: React.FormEvent) {
    e.preventDefault();
    const q = draft.trim();
    replaceParams((params) => {
      if (q) params.set('q', q);
      else params.delete('q');
    });
  }

  const hasFilters =
    filters.category !== 'all' || Boolean(filters.size) || Boolean(filters.brand) || filters.sort !== 'newest';

  const filterBoxes = [
    {
      key: 'category',
      label: t('category'),
      value: isCategory(filters.category) ? tCats(filters.category) : '',
    },
    { key: 'size', label: t('size'), value: filters.size },
    { key: 'brand', label: t('brand'), value: filters.brand },
    { key: 'sort', label: t('sort'), value: filters.sort === 'newest' ? '' : t(`sort_${filters.sort}`) },
  ];

  return (
    <div className="mx-auto w-full max-w-[1280px] pb-10 md:px-8">
      <div className="grid gap-3 px-4 pt-4 md:px-0 md:pt-6">
        <form onSubmit={submitQuery} role="search" className="flex h-11 items-center gap-2.5 rounded-btn bg-carton px-3 md:max-w-[520px]">
          <SearchIcon className="h-[18px] w-[18px] flex-none text-muted" />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={tNav('search_placeholder')}
            aria-label={tNav('search')}
            className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted md:text-[14px]"
          />
        </form>
        <h1 className={screenTitleClass}>{query ? t('results_for', { query }) : t('title')}</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden">
        {filterBoxes.map((box) => (
          <button
            key={box.key}
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={clsx(
              'inline-flex h-8 flex-none items-center gap-1.5 rounded-btn border px-3 text-[13px] text-ink',
              box.value ? 'border-ink font-semibold' : 'border-line'
            )}
          >
            {box.value ? `${box.label}: ${box.value}` : box.label}
            <ChevronIcon className="h-3.5 w-3.5 rotate-90 text-muted" />
          </button>
        ))}
      </div>

      <div className="flex items-baseline justify-between gap-3 px-4 pb-3 md:px-0">
        <p className="text-[13px] font-semibold tabular-nums text-ink">{t('count', { count: products.length })}</p>
        {hasFilters && (
          <button type="button" onClick={() => updateFilters(DEFAULT_FILTERS)} className="text-[13px] font-semibold text-accent">
            {t('clear')}
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={<SearchIcon />}
          title={query && !hasFilters ? t('empty_query_title', { query }) : t('empty_filters_title')}
          body={t('empty_body')}
        >
          {hasFilters && (
            <button type="button" onClick={() => updateFilters(DEFAULT_FILTERS)} className={buttonClass('soft')}>
              {t('clear')}
            </button>
          )}
          <Link href={`/${locale}`} className={buttonClass('primary')}>
            {t('explore')}
          </Link>
        </EmptyState>
      ) : (
        <ProductGrid products={products} />
      )}

      <SearchFilterDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        filters={filters}
        onChange={updateFilters}
        sizes={sizes}
        brands={brands}
        resultCount={products.length}
      />
    </div>
  );
}
