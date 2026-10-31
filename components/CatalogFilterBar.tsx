'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import SearchFilterDrawer, { type SearchFilters } from '@/components/SearchFilterDrawer';
import { ChevronIcon, SlidersIcon } from '@/components/ui/icons';
import { STORE_CATEGORIES, type StoreCategory } from '@/lib/categories';

function isCategory(v: string): v is StoreCategory {
  return (STORE_CATEGORIES as readonly string[]).includes(v);
}

// Filters that open the drawer. `boxes` are the 32px boxes of search; `text`
// is the profile row (uppercase labels after a sliders button, as in Grailed).
export default function CatalogFilterBar({
  filters,
  onChange,
  sizes,
  brands,
  resultCount,
  variant = 'boxes',
  className,
}: {
  filters: SearchFilters;
  onChange: (next: Partial<SearchFilters>) => void;
  sizes: string[];
  brands: string[];
  resultCount: number;
  variant?: 'boxes' | 'text';
  className?: string;
}) {
  const t = useTranslations('ui.search');
  const tCats = useTranslations('ui.cats');
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const boxes = [
    { key: 'sort', label: t('sort'), value: filters.sort === 'newest' ? '' : t(`sort_${filters.sort}`) },
    { key: 'size', label: t('size'), value: filters.size },
    {
      key: 'category',
      label: t('category'),
      value: isCategory(filters.category) ? tCats(filters.category) : '',
    },
    { key: 'brand', label: t('brand'), value: filters.brand },
  ];
  const activeCount = boxes.filter((box) => box.value).length;

  return (
    <>
      <div
        className={clsx(
          'flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className
        )}
      >
        {variant === 'text' && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t('filters')}
            className="relative grid h-7 w-7 flex-none place-items-center text-ink"
          >
            <SlidersIcon className="h-4 w-4" />
            {activeCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-ink px-0.5 text-[9px] font-bold text-paper">
                {activeCount}
              </span>
            )}
          </button>
        )}
        {boxes.map((box) =>
          variant === 'text' ? (
            <button
              key={box.key}
              type="button"
              onClick={() => setOpen(true)}
              className={clsx(
                'inline-flex h-7 flex-none items-center gap-1 rounded-btn px-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink',
                box.value && 'bg-carton'
              )}
            >
              {box.value ? `${box.label}: ${box.value}` : box.label}
              <ChevronIcon className="h-3 w-3 rotate-90 text-muted" />
            </button>
          ) : (
            <button
              key={box.key}
              type="button"
              onClick={() => setOpen(true)}
              className={clsx(
                'inline-flex h-8 flex-none items-center gap-1.5 rounded-btn border px-3 text-[13px] text-ink',
                box.value ? 'border-ink font-semibold' : 'border-line'
              )}
            >
              {box.value ? `${box.label}: ${box.value}` : box.label}
              <ChevronIcon className="h-3.5 w-3.5 rotate-90 text-muted" />
            </button>
          )
        )}
      </div>

      <SearchFilterDrawer
        open={open}
        onClose={close}
        filters={filters}
        onChange={onChange}
        sizes={sizes}
        brands={brands}
        resultCount={resultCount}
      />
    </>
  );
}
