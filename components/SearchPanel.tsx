'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/formatters';
import type { Locale } from '@/i18n';
import type { ProductData } from '@/lib/products';

interface SearchPanelProps {
  locale: Locale;
  query: string;
  onSelect: () => void;
}

type SortKey = 'newest' | 'price_asc' | 'price_desc';

const CATEGORIES = [
  { key: 'all', label: 'TODOS' },
  { key: 'hoodie', label: 'HOODIE' },
  { key: 'chamarra', label: 'CHAMARRA' },
  { key: 'pants', label: 'PANTS' },
  { key: 'jeans', label: 'JEANS' },
  { key: 'playeras', label: 'PLAYERAS' },
  { key: 'camisas', label: 'CAMISAS' },
  { key: 'accesorios', label: 'ACCESORIOS' },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'NUEVO' },
  { key: 'price_asc', label: 'PRECIO ↑' },
  { key: 'price_desc', label: 'PRECIO ↓' },
];

const labelStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

export default function SearchPanel({ locale, query, onSelect }: SearchPanelProps) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortKey>('newest');
  const [category, setCategory] = useState<string>('all');
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      runSearch(query, sort, category);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, category]);

  async function runSearch(q: string, s: SortKey, c: string) {
    setLoading(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      params.set('sort', s);
      params.set('category', c);
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const trimmed = query.trim();

  return (
    <div
      className="border-t px-8 py-6 overflow-y-auto"
      style={{ borderColor: 'rgba(0,0,0,0.08)', maxHeight: '70vh', background: 'white' }}
    >
      {/* Filtros: Sort + Categoría */}
      <div className="flex flex-col gap-3 mb-6">
        {/* Sort chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ ...labelStyle, fontWeight: 400, color: '#999' }}>ORDENAR</span>
          {SORTS.map((s) => {
            const active = sort === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                style={{
                  ...labelStyle,
                  fontSize: '10px',
                  background: active ? '#000' : 'transparent',
                  color: active ? '#fff' : '#000',
                  borderColor: active ? '#000' : 'rgba(0,0,0,0.2)',
                }}
                className="px-3 py-1 border transition-colors duration-150 hover:border-black"
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Category chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ ...labelStyle, fontWeight: 400, color: '#999' }}>CATEGORÍA</span>
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                style={{
                  ...labelStyle,
                  fontSize: '10px',
                  background: active ? '#000' : 'transparent',
                  color: active ? '#fff' : '#000',
                  borderColor: active ? '#000' : 'rgba(0,0,0,0.2)',
                }}
                className="px-3 py-1 border transition-colors duration-150 hover:border-black"
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resultados */}
      {loading && (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span style={{ ...labelStyle, fontWeight: 400, color: '#666' }}>
            Buscando...
          </span>
        </div>
      )}

      {!loading && hasSearched && products.length === 0 && (
        <p style={{ ...labelStyle, fontWeight: 400, color: '#666' }} className="py-4">
          {trimmed ? `Sin resultados para "${trimmed}".` : 'Sin productos en esta categoría.'}
        </p>
      )}

      {!loading && products.length > 0 && (
        <>
          <p style={{ ...labelStyle, fontWeight: 400, color: '#666' }} className="mb-4">
            {products.length} resultado{products.length > 1 ? 's' : ''}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/${locale}/products/${p.slug}`}
                onClick={onSelect}
                className="group block"
              >
                <div className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden mb-2">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:opacity-80 transition-opacity duration-200"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#EBEBEB]" />
                  )}

                  {p.isNew && !p.soldOut && (
                    <span
                      className="absolute top-2 left-2 bg-black text-white px-2 py-1"
                      style={{ ...labelStyle, fontSize: '9px' }}
                    >
                      NEW
                    </span>
                  )}

                  {p.soldOut && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <span style={{ ...labelStyle, fontSize: '10px' }}>SOLD OUT</span>
                    </div>
                  )}
                </div>

                <p className="text-black truncate" style={{ ...labelStyle, fontSize: '10px' }}>
                  {p.name}
                </p>
                <p style={{ ...labelStyle, fontSize: '10px', fontWeight: 400, color: '#666' }}>
                  {formatPrice(p.price, locale)}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
