import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getProducts } from '@/lib/products';
import SearchContent from './SearchContent';

export default async function SearchPage() {
  const [products, t] = await Promise.all([getProducts(), getTranslations('ui.search')]);

  return (
    <Suspense
      fallback={
        <div className="grid min-h-[50vh] place-items-center">
          <p role="status" className="text-[14px] text-muted">
            {t('loading')}
          </p>
        </div>
      }
    >
      <SearchContent initialProducts={products} />
    </Suspense>
  );
}
