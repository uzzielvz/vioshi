"use client";

import Image from "next/image";
import { Product } from "@/lib/products";
import { useCart } from "@/store/cartStore";
import { generateId } from "@/lib/utils";
import { useState } from "react";
import Link from "next/link";

interface ProductContentProps {
  product: Product;
  allProducts: Product[];
}

export default function ProductContent({ product, allProducts }: ProductContentProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.size || "");
  const [isAdding, setIsAdding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem, openCart } = useCart();

  // Use images array if available, otherwise use single image
  const galleryImages = product.images || [product.image];

  const currentIndex = allProducts.findIndex(p => p.id === product.id);
  const prevProduct = currentIndex > 0 ? allProducts[currentIndex - 1] : null;
  const nextProduct = currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1] : null;

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: generateId(),
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
      image: product.image,
      slug: product.slug,
      size: selectedSize || undefined,
    });

    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 500);
  };

  const categoryName = product.category === 'new' ? 'NEW ARRIVALS' :
                       product.category === 'hoodie' ? 'HOODIES' :
                       product.category === 'chamarra' ? 'CHAMARRAS' :
                       product.category === 'pants' ? 'PANTS' :
                       product.category === 'jeans' ? 'JEANS' :
                       product.category === 'camisas' ? 'CAMISAS' :
                       product.category === 'playeras' ? 'PLAYERAS' :
                       product.category === 'accesorios' ? 'ACCESORIOS' :
                       product.category === 'bolsos' ? 'BOLSOS' : 'SHOP';

  return (
    <main className="flex-1 pt-16">
      {/* Navigation - Desktop only */}
      <div className="hidden md:flex items-center justify-between px-8 py-4">
        <Link
          href={`/collections/${product.category || 'all'}`}
          className="flex items-center gap-2 hover:opacity-60 transition-opacity"
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}
        >
          <span>{'<'}</span> BACK TO {categoryName}
        </Link>

        {nextProduct && (
          <Link
            href={`/products/${nextProduct.slug}`}
            className="flex items-center gap-2 hover:opacity-60 transition-opacity"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}
          >
            NEXT PRODUCT <span>{'>'}</span>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 md:h-[calc(100vh-120px)] md:overflow-hidden">
        {/* Image Gallery - Left side (Desktop: Vertical scroll, Mobile: Horizontal scroll) */}
        <div className="relative bg-[#F5F5F5] md:overflow-y-auto md:h-full scrollbar-hide">
          {/* Desktop: Vertical scrollable gallery */}
          <div className="hidden md:block">
            <div className="flex flex-col">
              {galleryImages.map((img, index) => (
                <div key={index} className="relative w-full" style={{ height: '100vh' }}>
                  <Image
                    src={img}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Horizontal swipeable carousel */}
          <div className="md:hidden relative aspect-[3/4] overflow-hidden">
            <div
              className="flex transition-transform duration-300 h-full"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {galleryImages.map((img, index) => (
                <div key={index} className="relative min-w-full h-full">
                  <Image
                    src={img}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            {/* Carousel navigation dots */}
            {galleryImages.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-black w-6' : 'bg-gray-400'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Swipe buttons for mobile */}
            {galleryImages.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
                    aria-label="Previous image"
                  >
                    <span className="text-black">{'<'}</span>
                  </button>
                )}
                {currentImageIndex < galleryImages.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
                    aria-label="Next image"
                  >
                    <span className="text-black">{'>'}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Info - Right side */}
        <div className="p-8 md:p-12 flex flex-col md:overflow-y-auto md:h-full scrollbar-hide">
          <div className="flex-1">
            <h1
              className="uppercase tracking-wide mb-4"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}
            >
              {product.name}
            </h1>

            <p
              className="mb-8"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '13px',
                fontWeight: 400
              }}
            >
              ${product.price.toLocaleString()}
            </p>

            {/* Size Selector */}
            {!product.soldOut && product.size && (
              <div className="mb-8">
                <p
                  className="uppercase tracking-wide mb-3"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}
                >
                  {product.size}
                </p>
              </div>
            )}

            <p
              className="text-gray-600 mb-8 leading-relaxed text-xs"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px'
              }}
            >
              Free standard shipping in US for orders over $200 USD. Exclusions apply.
            </p>

            {/* Collapsible sections */}
            <div className="space-y-4 mb-8">
              <details className="group border-b border-gray-200 pb-4">
                <summary
                  className="flex justify-between items-center cursor-pointer uppercase tracking-wide list-none"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}
                >
                  PRODUCT DETAILS
                  <span className="text-xs text-gray-400 font-light">+</span>
                </summary>
                <p
                  className="mt-4 text-gray-600 leading-relaxed"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px'
                  }}
                >
                  {product.description || "Premium quality streetwear. Made with attention to detail."}
                </p>
              </details>

              <details className="group border-b border-gray-200 pb-4">
                <summary
                  className="flex justify-between items-center cursor-pointer uppercase tracking-wide list-none"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}
                >
                  SIZE GUIDE
                  <span className="text-xs text-gray-400 font-light">+</span>
                </summary>
                <p
                  className="mt-4 text-gray-600 leading-relaxed"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px'
                  }}
                >
                  Consulta nuestra guía de tallas para encontrar el ajuste perfecto.
                </p>
              </details>
            </div>
          </div>

          {/* Add to Bag - Fixed at bottom */}
          <div className="mt-auto">
            {product.soldOut ? (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-500 py-4 uppercase tracking-wide cursor-not-allowed"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.05em'
                }}
              >
                Sold Out
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full py-4 uppercase tracking-wide transition-colors bg-black text-white hover:bg-gray-800"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.05em'
                }}
              >
                {isAdding ? "ADDING..." : "ADD TO BAG"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
