'use client';

import { useTranslations } from 'next-intl';
import ProductGrid from '@/components/ProductGrid';
import { screenTitleClass } from '@/components/ui/styles';

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
  /** Model's one-sentence description of the uploaded garment */
  aiDescription?: string;
  /** Object URL of the uploaded photo */
  previewUrl: string;
}

// Results keep the API order (best match first), so there is no sort here.
export default function VisualSearchResults({ results, aiDescription, previewUrl }: VisualSearchResultsProps) {
  const t = useTranslations('ui.visual');
  const tSearch = useTranslations('ui.search');

  const products = results.map((r) => ({
    id: r.id,
    name: r.name,
    price: r.price_mxn,
    image: r.image_url ?? '',
    slug: r.slug,
  }));

  return (
    <div className="mx-auto w-full max-w-[1280px] pb-10 md:px-8">
      <div className="flex items-center gap-3.5 px-4 pb-4 pt-5 md:px-0 md:pt-8">
        <div className="h-[72px] w-14 flex-none overflow-hidden bg-carton">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={t('your_photo')} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <h1 className={screenTitleClass}>{t('title')}</h1>
          {aiDescription && <p className="mt-0.5 text-[13px] leading-[1.45] text-muted">{aiDescription}</p>}
        </div>
      </div>
      <p className="px-4 pb-3 text-[13px] font-semibold tabular-nums text-ink md:px-0">
        {tSearch('count', { count: products.length })}
      </p>
      <ProductGrid products={products} />
    </div>
  );
}
