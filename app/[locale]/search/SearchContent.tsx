'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProductGrid from '@/components/ProductGrid';
import FollowButton from '@/components/FollowButton';
import CatalogFilterBar from '@/components/CatalogFilterBar';
import { DEFAULT_FILTERS } from '@/components/SearchFilterDrawer';
import EmptyState from '@/components/ui/EmptyState';
import { SearchIcon } from '@/components/ui/icons';
import { buttonClass, screenTitleClass } from '@/components/ui/styles';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import type { ProductData } from '@/lib/products';

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
  const { locale } = useLocaleContext();
  const t = useTranslations('ui.search');
  const tNav = useTranslations('ui.nav');

  const query = (searchParams.get('q') ?? '').trim();
  const [draft, setDraft] = useState(query);

  useEffect(() => setDraft(query), [query]);

  const matching = useMemo(() => {
    const q = query.toLowerCase();
    return q ? initialProducts.filter((p) => matchesQuery(p, q)) : initialProducts;
  }, [initialProducts, query]);

  const { filters, sizes, brands, products, hasFilters, updateFilters, replaceParams } = useCatalogFilters(matching);

  // A brand filter is the brand's page for now, so it offers «Seguir».
  const brandToFollow = useMemo(() => {
    if (!filters.brand) return null;
    const match = initialProducts.find((p) => p.brand?.name === filters.brand)?.brand;
    return match?.id ? { id: match.id, name: match.name } : null;
  }, [initialProducts, filters.brand]);

  function submitQuery(e: React.FormEvent) {
    e.preventDefault();
    const q = draft.trim();
    replaceParams((params) => {
      if (q) params.set('q', q);
      else params.delete('q');
    });
  }

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

      <CatalogFilterBar
        filters={filters}
        onChange={updateFilters}
        sizes={sizes}
        brands={brands}
        resultCount={products.length}
        className="px-4 py-3 md:px-0"
      />

      <div className="flex min-h-[30px] items-center justify-between gap-3 px-4 pb-3 md:px-0">
        <p className="text-[13px] font-semibold tabular-nums text-ink">{t('count', { count: products.length })}</p>
        <div className="flex items-center gap-4">
          {hasFilters && (
            <button type="button" onClick={() => updateFilters(DEFAULT_FILTERS)} className="text-[13px] font-semibold text-accent">
              {t('clear')}
            </button>
          )}
          {brandToFollow && <FollowButton kind="brand" id={brandToFollow.id} name={brandToFollow.name} />}
        </div>
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
    </div>
  );
}
