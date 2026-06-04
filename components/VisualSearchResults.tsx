'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import ProductGrid from '@/components/ProductGrid';
import SearchFilterDrawer, { type SortKey } from '@/components/SearchFilterDrawer';
import type { ProductData } from '@/lib/products';

interface VSResult {
  id: string;
  slug: string;
  name: string;
  price_mxn: number;
  image_url: string | null;
  similarity: number;
}

interface VisualSearchResultsProps {
  /** Results already sorted by similarity desc from the API */
  results: VSResult[];
  /** Gemini's one-sentence description of the uploaded garment (demo observability) */
  aiDescription?: string;
}

/**
 * VisualSearchResults (VS-09 / VS-10)
 * Renders the API results using the exact same post-PRO-12 layout as /search:
 * - Title row with visual_title + left counter + single right FILTRAR (underlined)
 * - ProductGrid
 * - SearchFilterDrawer (client-side sort + category filter over the small result set)
 *
 * No URL param sync (transient results). Empty state delegated to ProductGrid.
 * CartProvider + NextIntlClientProvider are inherited from the [locale] layout shell.
 */
export default function VisualSearchResults({ results, aiDescription }: VisualSearchResultsProps) {
  const t = useTranslations('search');

  const topSimilarity = results.length
    ? Math.round((results[0]?.similarity ?? 0) * 100)
    : 0;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>('newest');
  const [category, setCategory] = useState<string>('all');

  // Convert API shape → ProductData shape expected by ProductGrid
  const baseProducts: ProductData[] = results.map((r) => ({
    id: r.id,
    name: r.name,
    price: r.price_mxn,
    image: r.image_url ?? '',
    slug: r.slug,
    // description / category not critical for the grid cards in this context
  }));

  // Client-side filter + sort (identical logic to SearchContent post-PRO-12)
  const products = useMemo(() => {
    let list = [...baseProducts];

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
        // keep API similarity order for 'newest' (already best-match first)
        break;
    }
    return sorted;
  }, [baseProducts, sort, category]);

  function handleDrawerChange(next: { sort: SortKey; category: string }) {
    setSort(next.sort);
    setCategory(next.category);
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
      {/* Title for visual search results (no emoji per request) */}
      <div className="mb-6 md:mb-8">
        <h1 style={labelStyle}>{t('visual_title')}</h1>
        {aiDescription && (
          <p
            className="mt-3 max-w-2xl"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '12px',
              lineHeight: 1.5,
              color: '#666',
            }}
          >
            <span style={{ color: '#000', fontWeight: 500 }}>Gemini:</span>{' '}
            “{aiDescription}”
            {topSimilarity > 0 && (
              <span style={{ color: '#999' }}>
                {' '}· {topSimilarity}% match
              </span>
            )}
          </p>
        )}
      </div>

      {/* Identical post-PRO-12 title row: counter + single FILTRAR */}
      <div
        className="flex items-center justify-between mb-8 md:mb-10 pb-4 border-b"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        <span style={{ ...labelStyle, fontWeight: 400, color: '#999' }}>
          {t('showing_results', { count: products.length })}
        </span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          style={{ ...labelStyle, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px' }}
          className="hover:opacity-60 transition-opacity"
        >
          {t('filter')}
        </button>
      </div>

      <ProductGrid products={products} />

      <SearchFilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sort={sort}
        category={category}
        onChange={handleDrawerChange}
      />
    </div>
  );
}
