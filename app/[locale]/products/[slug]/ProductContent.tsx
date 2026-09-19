"use client";

import Image from "next/image";
import { ProductData as Product } from "@/lib/products";
import { useCart } from "@/store/cartStore";
import { generateId } from "@/lib/utils";
import { formatPrice } from "@/lib/formatters";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import {
  CONDITION_LABELS,
  CONDITION_LABELS_EN,
  MEASUREMENT_LABELS,
  MEASUREMENT_LABELS_EN,
  requiredMeasurements,
  type MeasurementKey,
} from "@/lib/garments";

interface ProductContentProps {
  product: Product;
  allProducts: Product[];
}

// Misma familia que el resto de la ficha. El sistema de diseño va después.
const BASE_FONT = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
} as const;

export default function ProductContent({ product, allProducts }: ProductContentProps) {
  const tCart = useTranslations("cart");
  const t = useTranslations("product");
  const { locale } = useLocaleContext();
  const [selectedSize, setSelectedSize] = useState<string>(product.size || "");
  const [isAdding, setIsAdding] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { addItem, openCart } = useCart();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Use images array if available, otherwise use single image
  const galleryImages = product.images || [product.image];

  // Etiquetas de medidas y estado viven junto al modelo de dominio
  // (lib/garments) para no duplicar el mapa tipo → medidas en los mensajes.
  const measurementLabels = locale === 'en' ? MEASUREMENT_LABELS_EN : MEASUREMENT_LABELS;
  const conditionLabels   = locale === 'en' ? CONDITION_LABELS_EN   : CONDITION_LABELS;

  const estado = product.availability ?? (product.soldOut ? 'vendida' : 'disponible');

  // Orden estable y explícito: el que define el tipo de prenda, no el del objeto.
  const measurementEntries = requiredMeasurements(product.garmentType)
    .map((key) => [key, product.measurements?.[key]] as const)
    .filter((entry): entry is readonly [MeasurementKey, number] => typeof entry[1] === 'number');

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

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 500);
  };

  const CAT_KEYS: Record<string, string> = {
    new: 'cat_new', hoodie: 'cat_hoodie', chamarra: 'cat_chamarra',
    pants: 'cat_pants', jeans: 'cat_jeans', camisas: 'cat_camisas',
    playeras: 'cat_playeras', accesorios: 'cat_accesorios', bolsos: 'cat_bolsos',
  };
  const catKey = (CAT_KEYS[product.category || ''] ?? 'cat_default') as Parameters<typeof t>[0];
  const categoryName = t(catKey);

  return (
    <main className="flex-1 pt-16">
      {/* Navigation - Desktop only */}
      <div className="hidden md:flex items-center justify-between px-8 py-4">
        <Link
          href={`/${locale}/collections/${product.category || 'all'}`}
          className="flex items-center gap-2 hover:opacity-60 transition-opacity"
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}
        >
          <span>{'<'}</span> {t('back_to')} {categoryName}
        </Link>

        {nextProduct && (
          <Link
            href={`/${locale}/products/${nextProduct.slug}`}
            className="flex items-center gap-2 hover:opacity-60 transition-opacity"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}
          >
            {t('next_product')} <span>{'>'}</span>
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
              className={product.store ? 'mb-2' : 'mb-8'}
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '13px',
                fontWeight: 400
              }}
            >
              {formatPrice(product.price, locale)}
            </p>

            {/* Quién vende la prenda. Hoy siempre Viogi; el link ya existe para
                cuando haya más de una tienda. */}
            {product.store && (
              <p className="mb-8" style={{ ...BASE_FONT, fontSize: '11px', color: '#666' }}>
                {t('sold_by')}{' '}
                <Link
                  href={`/${locale}/tienda/${product.store.slug}`}
                  className="underline hover:opacity-60 transition-opacity"
                  style={{ color: '#000' }}
                >
                  {product.store.name}
                </Link>
              </p>
            )}

            {/* Talla, medidas y estado — visibles sin abrir acordeón.
                En segunda mano son el dato que decide la compra. */}
            {(product.size || measurementEntries.length > 0 || product.condition) && (
              <div className="mb-8 space-y-2">
                {product.size && (
                  <p style={{ ...BASE_FONT, fontSize: '11px', fontWeight: 500 }}>
                    <span style={{ color: '#666' }}>{t('size_marked')}: </span>
                    {product.size}
                  </p>
                )}

                {measurementEntries.length > 0 && (
                  <p style={{ ...BASE_FONT, fontSize: '11px', fontWeight: 400 }}>
                    {measurementEntries
                      .map(([key, value]) => `${measurementLabels[key]} ${value} cm`)
                      .join(' · ')}
                  </p>
                )}

                {product.condition && (
                  <p style={{ ...BASE_FONT, fontSize: '11px', fontWeight: 400 }}>
                    <span style={{ color: '#666' }}>{t('condition')}: </span>
                    {conditionLabels[product.condition]}
                  </p>
                )}

                {/* Misma prominencia que las medidas: esconder los defectos es
                    lo que rompe la confianza en segunda mano. */}
                {product.condition === 'con_detalles' && product.defectNotes && (
                  <p style={{ ...BASE_FONT, fontSize: '11px', fontWeight: 400 }}>
                    <span style={{ color: '#666' }}>{t('flaws')}: </span>
                    {product.defectNotes}
                  </p>
                )}

                {measurementEntries.length > 0 && (
                  <p
                    style={{
                      ...BASE_FONT,
                      fontSize: '10px',
                      lineHeight: 1.5,
                      color: '#666',
                      paddingTop: '4px',
                    }}
                  >
                    {t('measurement_note')}
                  </p>
                )}
              </div>
            )}

            <p
              className="mb-8"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: "10px",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                lineHeight: 1.5,
                color: "#666",
              }}
            >
              {tCart("free_shipping_note")}
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
                  {t('product_details')}
                  <span className="text-xs text-gray-400 font-light">+</span>
                </summary>
                <div className="mt-4 space-y-4">
                  {product.description && (
                    <p
                      className="text-gray-600 leading-relaxed"
                      style={{
                        fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                        fontSize: '11px'
                      }}
                    >
                      {product.description}
                    </p>
                  )}

                  {product.attributes && product.attributes.length > 0 && (
                    <dl className="space-y-2 pt-2">
                      {product.attributes.map(({ key, value }) => (
                        <div key={key} className="flex gap-4">
                          <dt
                            className="uppercase tracking-widest text-gray-400 shrink-0"
                            style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif", fontSize: '10px', minWidth: '80px' }}
                          >
                            {key}
                          </dt>
                          <dd
                            className="text-gray-800"
                            style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif", fontSize: '11px' }}
                          >
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </details>

            </div>
          </div>

          {/* Add to Bag - Fixed at bottom */}
          <div className="mt-auto space-y-3">
            {estado === 'vendida' ? (
              <>
                {/* La ficha de una prenda vendida NO da 404: el link ya circuló
                    por WhatsApp y va a seguir recibiendo visitas. Se muestra
                    marcada, con salida hacia lo que sí está disponible. */}
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-500 py-4 uppercase tracking-wide cursor-not-allowed border border-gray-200"
                  style={{ ...BASE_FONT, fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}
                >
                  {t('sold_out')}
                </button>
                <p style={{ ...BASE_FONT, fontSize: '11px', color: '#666', lineHeight: 1.6 }}>
                  {t('sold_note')}
                </p>
                <Link
                  href={`/${locale}/collections/all`}
                  className="block w-full border border-black text-black py-4 uppercase tracking-wide text-center hover:bg-black hover:text-white transition-colors"
                  style={{ ...BASE_FONT, fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}
                >
                  {t('see_others')}
                </Link>
              </>
            ) : estado === 'apartada' ? (
              <>
                {/* APARTADA no es VENDIDA: puede liberarse, así que el mensaje
                    invita a esperar en vez de cerrar la puerta. */}
                <button
                  disabled
                  className="w-full bg-white text-black py-4 uppercase tracking-wide cursor-not-allowed border border-black"
                  style={{ ...BASE_FONT, fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}
                >
                  {t('reserved')}
                </button>
                <p style={{ ...BASE_FONT, fontSize: '11px', color: '#666', lineHeight: 1.6 }}>
                  {t('reserved_note')}
                </p>
              </>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full py-4 uppercase tracking-wide transition-colors bg-black text-white hover:bg-gray-800"
                style={{ ...BASE_FONT, fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em' }}
              >
                {isAdding ? t('adding') : t('add_to_bag')}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
