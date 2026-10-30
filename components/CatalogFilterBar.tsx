'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import SearchFilterDrawer, { type SearchFilters } from '@/components/SearchFilterDrawer';
import { ChevronIcon } from '@/components/ui/icons';
import { STORE_CATEGORIES, type StoreCategory } from '@/lib/categories';

function isCategory(v: string): v is StoreCategory {
  return (STORE_CATEGORIES as readonly string[]).includes(v);
}

// Row of 32px filter boxes; any box opens the filter drawer.
export default function CatalogFilterBar({
  filters,
  onChange,
  sizes,
  brands,
  resultCount,
  className,
}: {
  filters: SearchFilters;
  onChange: (next: Partial<SearchFilters>) => void;
  sizes: string[];
  brands: string[];
  resultCount: number;
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

  return (
    <>
      <div
        className={clsx(
          'flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          className
        )}
      >
        {boxes.map((box) => (
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
        ))}
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
