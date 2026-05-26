'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProductGrid from '@/components/ProductGrid';
import SearchFilterDrawer, { type SortKey } from '@/components/SearchFilterDrawer';
import type { ProductData } from '@/lib/products';

const SORT_KEYS: SortKey[] = ['newest', 'price_asc', 'price_desc'];

function isSortKey(v: string | null): v is SortKey {
  return !!v && (SORT_KEYS as string[]).includes(v);
}

export default function SearchContent({ initialProducts }: { initialProducts: ProductData[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('search');

  const query = (searchParams.get('q') ?? '').trim();
  const sortParam = searchParams.get('sort');
  const sort: SortKey = isSortKey(sortParam) ? sortParam : 'newest';
  const category = searchParams.get('category') ?? 'all';

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filtrar + ordenar memoizado
  const products = useMemo(() => {
    const q = query.toLowerCase();
    let list = initialProducts;

    if (q) {
      list = list.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          (p.category?.toLowerCase().includes(q) ?? false)
        );
      });
    }

    if (category && category !== 'all') {
      list = list.filter((p) => p.category === category);
    }

    const sorted = [...list];
    switch (sort) {
      case 'price_asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        // initialProducts ya viene ordenado por created_at desc
        break;
    }
    return sorted;
  }, [initialProducts, query, sort, category]);

  // Actualiza URL sin recargar
  function updateParams(next: Partial<{ sort: SortKey; category: string }>) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.sort !== undefined) {
      if (next.sort === 'newest') params.delete('sort');
      else params.set('sort', next.sort);
    }
    if (next.category !== undefined) {
      if (next.category === 'all') params.delete('category');
      else params.set('category', next.category);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  return (
    <div className="px-4 md:px-8 py-8 md:py-12">
      {/* Título con ícono de lupa (estilo catálogo Stüssy) */}
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <svg
          className="w-4 h-4 text-black flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <h1 style={labelStyle}>
          {query
            ? t('search_results_for', { query })
            : t('empty_title')}
        </h1>
      </div>

      {/* Línea minimalista: SHOWING N RESULTS · FILTER · ORDER BY */}
      <div className="text-center mb-8 md:mb-10 flex items-center justify-center gap-3 flex-wrap">
        <span style={{ ...labelStyle, fontWeight: 400, color: '#999' }}>
          {t('showing_results', { count: products.length })}
        </span>
        <span style={{ ...labelStyle, fontWeight: 400, color: '#999' }}>·</span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          style={{ ...labelStyle, fontWeight: 400, color: '#999' }}
          className="hover:text-black transition-colors duration-200"
        >
          {t('filter')}
        </button>
        <span style={{ ...labelStyle, fontWeight: 400, color: '#999' }}>·</span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          style={{ ...labelStyle, fontWeight: 400, color: '#999' }}
          className="hover:text-black transition-colors duration-200"
        >
          {t('order_by')}
        </button>
      </div>

      {/* Grid de productos */}
      <ProductGrid products={products} />

      {/* Drawer lateral */}
      <SearchFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sort={sort}
        category={category}
        onChange={(next) => updateParams(next)}
      />
    </div>
  );
}
