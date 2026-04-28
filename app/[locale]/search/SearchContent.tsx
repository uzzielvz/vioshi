'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import ProductGrid from '@/components/ProductGrid';
import { ProductData } from '@/lib/products';

export default function SearchContent({ initialProducts }: { initialProducts: ProductData[] }) {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const t = useTranslations('search');
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  const filteredProducts = initialProducts.filter((product) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.category && product.category.toLowerCase().includes(searchLower)) ||
      (product.description && product.description.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('placeholder')}
                className="w-full px-6 py-4 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black placeholder:text-gray-400 placeholder:text-sm placeholder:tracking-wider text-lg"
                autoFocus
              />
              <svg
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Results Header */}
        {searchQuery && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-wider">
              {filteredProducts.length > 0
                ? `${t('results_found', { count: filteredProducts.length })} "${searchQuery}"`
                : `${t('no_results_for')} "${searchQuery}"`}
            </h1>
          </div>
        )}

        {/* Results */}
        {!searchQuery ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-wider">{t('empty_title')}</h2>
                <p className="text-gray-600">{t('empty_subtitle')}</p>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-3">{t('popular_title')}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Hoodie', 'Chamarra', 'Playera', 'Pants', 'Accesorios'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="px-4 py-2 border border-gray-300 rounded-full text-sm hover:border-black hover:bg-black hover:text-white transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-wider">{t('no_results_title')}</h2>
                <p className="text-gray-600">
                  {t('no_results_text')} &quot;{searchQuery}&quot;
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium uppercase tracking-wider">{t('suggestions_title')}:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>{t('suggestion_1')}</li>
                  <li>{t('suggestion_2')}</li>
                  <li>{t('suggestion_3')}</li>
                </ul>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="inline-block border-2 border-black text-black px-6 py-3 rounded uppercase tracking-wider font-medium hover:bg-black hover:text-white transition-colors"
              >
                {t('clear_search')}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:border-black transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm uppercase tracking-wider">{t('filters')}</span>
              </button>
              <select className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-sm uppercase tracking-wider appearance-none bg-white pr-10">
                <option>{t('sort_by')}</option>
                <option>{t('sort_relevance')}</option>
                <option>{t('sort_newest')}</option>
                <option>{t('sort_price_asc')}</option>
                <option>{t('sort_price_desc')}</option>
              </select>
            </div>
            <ProductGrid products={filteredProducts} />
          </>
        )}
      </div>
    </div>
  );
}
