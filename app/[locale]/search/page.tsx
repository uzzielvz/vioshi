import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getProducts } from '@/lib/products';
import SearchContent from './SearchContent';

export default async function SearchPage() {
  const [products, t] = await Promise.all([
    getProducts(),
    getTranslations('search'),
  ]);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm uppercase tracking-wider text-gray-600">
              {t('loading_short')}
            </p>
          </div>
        </div>
      }
    >
      <SearchContent initialProducts={products} />
    </Suspense>
  );
}
