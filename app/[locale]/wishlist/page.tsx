'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { formatPrice } from '@/lib/formatters';
import { getProducts, ProductData as Product } from '@/lib/products';
import { STORAGE_KEYS } from '@/lib/constants';

const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

export default function WishlistPage() {
  const t = useTranslations('wishlist');
  const tProduct = useTranslations('product');
  const { locale } = useLocaleContext();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hidratar desde localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (stored) setWishlistIds(JSON.parse(stored));
    } catch {}
    setInitialized(true);
  }, []);

  // Persistir cada vez que cambia la lista (solo tras hidratación)
  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlistIds));
  }, [wishlistIds, initialized]);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await getProducts();
      setAllProducts(data);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  const wishlistProducts = allProducts.filter((product) =>
    wishlistIds.includes(product.id)
  );

  const handleRemove = (productId: string) => {
    setWishlistIds(wishlistIds.filter((id) => id !== productId));
  };

  const handleClear = () => {
    if (confirm(t('confirm_clear'))) {
      setWishlistIds([]);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <p className="uppercase tracking-wider text-gray-500" style={{ ...fontStyle, fontSize: '11px' }}>
          {t('loading')}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="uppercase tracking-wide" style={{ ...fontStyle, fontSize: '13px', fontWeight: 500 }}>
            {t('title')}
          </h1>
          {wishlistProducts.length > 0 && (
            <button
              onClick={handleClear}
              className="uppercase tracking-wide text-gray-500 hover:text-black transition-colors underline"
              style={{ ...fontStyle, fontSize: '11px' }}
            >
              {t('clear')}
            </button>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="uppercase tracking-wide mb-3" style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}>
              {t('empty_title')}
            </h2>
            <p className="text-gray-500 mb-8" style={{ ...fontStyle, fontSize: '11px' }}>
              {t('empty_subtitle')}
            </p>
            <Link
              href={`/${locale}/collections/all`}
              className="bg-black text-white px-8 py-3 uppercase tracking-wide hover:bg-gray-800 transition-colors"
              style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
            >
              {t('explore')}
            </Link>
          </div>
        ) : (
          <>
            <p className="uppercase tracking-wide text-gray-500 mb-6" style={{ ...fontStyle, fontSize: '11px' }}>
              {t('count', { count: wishlistProducts.length })}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlistProducts.map((product) => (
                <div key={product.id} className="group relative">
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 z-10 w-7 h-7 bg-white flex items-center justify-center hover:opacity-60 transition-opacity"
                    aria-label={t('clear')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <Link href={`/${locale}/products/${product.slug}`}>
                    <div className="aspect-[3/4] bg-[#F5F5F5] overflow-hidden relative mb-3">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  <div className="space-y-1">
                    <Link href={`/${locale}/products/${product.slug}`}>
                      <h3 className="uppercase tracking-wide hover:opacity-60 transition-opacity" style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}>
                        {product.name}
                      </h3>
                    </Link>
                    <p style={{ ...fontStyle, fontSize: '11px', color: '#666' }}>
                      {formatPrice(product.price, locale)}
                    </p>
                    <button
                      className="w-full bg-black text-white py-2 uppercase tracking-wide hover:bg-gray-800 transition-colors mt-2"
                      style={{ ...fontStyle, fontSize: '10px', fontWeight: 500 }}
                    >
                      {tProduct('add_to_cart')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href={`/${locale}/collections/all`}
                className="uppercase tracking-wide hover:opacity-60 transition-opacity"
                style={{ ...fontStyle, fontSize: '11px', fontWeight: 500 }}
              >
                ← {t('continue_shopping')}
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
