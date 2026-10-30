'use client';

import { useTranslations } from 'next-intl';
import CatalogFilterBar from '@/components/CatalogFilterBar';
import ProductGrid from '@/components/ProductGrid';
import { DEFAULT_FILTERS } from '@/components/SearchFilterDrawer';
import EmptyState from '@/components/ui/EmptyState';
import { BagIcon } from '@/components/ui/icons';
import { buttonClass } from '@/components/ui/styles';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import type { ProductData } from '@/lib/products';

// A profile's pieces under its tabs: the filter row, the count and the feed grid.
export default function ProfileCatalog({
  products: source,
  emptyTitle,
  emptyBody,
}: {
  products: ProductData[];
  emptyTitle: string;
  emptyBody?: string;
}) {
  const t = useTranslations('ui.search');
  const { filters, sizes, brands, products, hasFilters, updateFilters } = useCatalogFilters(source);

  if (source.length === 0) {
    return <EmptyState icon={<BagIcon />} title={emptyTitle} body={emptyBody} />;
  }

  return (
    <>
      <CatalogFilterBar
        filters={filters}
        onChange={updateFilters}
        sizes={sizes}
        brands={brands}
        resultCount={products.length}
        className="px-4 pb-3 md:px-0"
      />

      <div className="flex min-h-[30px] items-center justify-between gap-3 px-4 pb-3 md:px-0">
        <p className="text-[13px] font-semibold tabular-nums text-ink">{t('count', { count: products.length })}</p>
        {hasFilters && (
          <button type="button" onClick={() => updateFilters(DEFAULT_FILTERS)} className="text-[13px] font-semibold text-accent">
            {t('clear')}
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState icon={<BagIcon />} title={t('empty_filters_title')}>
          <button type="button" onClick={() => updateFilters(DEFAULT_FILTERS)} className={buttonClass('soft')}>
            {t('clear')}
          </button>
        </EmptyState>
      ) : (
        <ProductGrid products={products} />
      )}
    </>
  );
}
