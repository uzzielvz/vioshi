'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, Product } from '@/lib/products';

// Mock wishlist data - in real app this would come from context/store
const mockWishlistIds = ['1', '2', '3'];

export default function WishlistPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState(mockWishlistIds);
  const [isLoading, setIsLoading] = useState(true);

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
    if (confirm('¿Estás seguro de que quieres vaciar tu wishlist?')) {
      setWishlistIds([]);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm uppercase tracking-wider text-gray-600">
            Cargando wishlist...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold uppercase tracking-wider">
            Mi Wishlist
          </h1>
          {wishlistProducts.length > 0 && (
            <button
              onClick={handleClear}
              className="text-sm uppercase tracking-wider text-gray-600 hover:text-red-600 transition-colors underline"
            >
              Vaciar Wishlist
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto space-y-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold uppercase tracking-wider">
                  Tu Wishlist Está Vacía
                </h2>
                <p className="text-gray-600">
                  Guarda tus productos favoritos para comprarlos más tarde
                </p>
              </div>
              <Link
                href="/collections/all"
                className="inline-block bg-black text-white px-8 py-4 rounded uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors"
              >
                Explorar Productos
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Products Count */}
            <p className="text-sm uppercase tracking-wider text-gray-600 mb-6">
              {wishlistProducts.length} Producto
              {wishlistProducts.length !== 1 ? 's' : ''}
            </p>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-black transition-colors"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-600 transition-colors"
                    aria-label="Remover de wishlist"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>

                  {/* Product Image */}
                  <Link href={`/products/${product.slug}`}>
                    <div className="aspect-square bg-gray-100 overflow-hidden relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-medium text-sm mb-1 group-hover:underline">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        {product.category}
                      </p>
                      <p className="font-bold">${product.price.toFixed(2)}</p>
                    </Link>

                    {/* Add to Cart Button */}
                    <button className="w-full mt-3 bg-black text-white py-2 rounded text-xs uppercase tracking-wider font-medium hover:bg-gray-800 transition-colors">
                      Añadir a Bolsa
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-12 text-center">
              <Link
                href="/collections/all"
                className="inline-block border-2 border-black text-black px-8 py-4 rounded uppercase tracking-wider font-medium hover:bg-black hover:text-white transition-colors"
              >
                Seguir Comprando
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
