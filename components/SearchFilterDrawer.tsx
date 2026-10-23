'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { STORE_CATEGORIES } from '@/lib/categories';
import { CloseIcon } from '@/components/ui/icons';
import { buttonClass, sectionLabelClass } from '@/components/ui/styles';

export type SortKey = 'newest' | 'price_asc' | 'price_desc';

export interface SearchFilters {
  sort: SortKey;
  category: string;
  size: string;
  brand: string;
}

export const DEFAULT_FILTERS: SearchFilters = { sort: 'newest', category: 'all', size: '', brand: '' };

const SORTS: { key: SortKey; label: 'sort_newest' | 'sort_price_asc' | 'sort_price_desc' }[] = [
  { key: 'newest', label: 'sort_newest' },
  { key: 'price_asc', label: 'sort_price_asc' },
  { key: 'price_desc', label: 'sort_price_desc' },
];

function Pick({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        'h-9 rounded-btn border px-3 text-[13px] text-ink',
        selected ? 'border-ink font-semibold' : 'border-line'
      )}
    >
      {children}
    </button>
  );
}

// Bottom sheet on phones, side panel on desktop. Changes apply right away.
export default function SearchFilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  sizes,
  brands,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onChange: (next: Partial<SearchFilters>) => void;
  sizes: string[];
  brands: string[];
  resultCount: number;
}) {
  const t = useTranslations('ui.search');
  const tCats = useTranslations('ui.cats');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const section = (label: string, children: React.ReactNode) => (
    <section className="grid gap-2.5">
      <h3 className={sectionLabelClass}>{label}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-[60] bg-ink/40" aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('filters')}
        className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[85vh] flex-col bg-paper md:inset-y-0 md:left-auto md:max-h-none md:w-[400px]"
      >
        <div className="flex h-14 flex-none items-center justify-between border-b border-line px-4">
          <h2 className="text-[16px] font-bold text-ink">{t('filters')}</h2>
          <button type="button" onClick={onClose} aria-label={t('close')} className="-mr-2 grid h-10 w-10 place-items-center">
            <CloseIcon className="h-[22px] w-[22px]" />
          </button>
        </div>

        <div className="grid flex-1 content-start gap-6 overflow-y-auto px-4 py-5">
          {section(
            t('sort'),
            SORTS.map((s) => (
              <Pick key={s.key} selected={filters.sort === s.key} onClick={() => onChange({ sort: s.key })}>
                {t(s.label)}
              </Pick>
            ))
          )}
          {section(
            t('category'),
            (['all', ...STORE_CATEGORIES] as const).map((slug) => (
              <Pick key={slug} selected={filters.category === slug} onClick={() => onChange({ category: slug })}>
                {tCats(slug)}
              </Pick>
            ))
          )}
          {sizes.length > 0 &&
            section(t('size'), [
              <Pick key="any" selected={!filters.size} onClick={() => onChange({ size: '' })}>
                {t('any')}
              </Pick>,
              ...sizes.map((size) => (
                <Pick key={size} selected={filters.size === size} onClick={() => onChange({ size })}>
                  {size}
                </Pick>
              )),
            ])}
          {brands.length > 0 &&
            section(t('brand'), [
              <Pick key="any" selected={!filters.brand} onClick={() => onChange({ brand: '' })}>
                {t('any')}
              </Pick>,
              ...brands.map((brand) => (
                <Pick key={brand} selected={filters.brand === brand} onClick={() => onChange({ brand })}>
                  {brand}
                </Pick>
              )),
            ])}
        </div>

        <div className="grid flex-none grid-cols-2 gap-2 border-t border-line px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
          <button type="button" onClick={() => onChange(DEFAULT_FILTERS)} className={buttonClass('soft')}>
            {t('clear')}
          </button>
          <button type="button" onClick={onClose} className={buttonClass('primary')}>
            {t('show', { count: resultCount })}
          </button>
        </div>
      </aside>
    </>
  );
}
