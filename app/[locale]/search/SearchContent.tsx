'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import SearchPanel from '@/components/SearchPanel';
import { ProductData } from '@/lib/products';

export default function SearchContent({ initialProducts: _initialProducts }: { initialProducts: ProductData[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const t = useTranslations('search');
  const { locale } = useLocaleContext();
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Barra de búsqueda */}
      <div
        className="border-b"
        style={{ borderColor: 'rgba(0,0,0,0.08)' }}
      >
        <form
          className="max-w-7xl mx-auto flex items-center gap-4 py-4 px-8"
          onSubmit={(e) => {
            e.preventDefault();
            const q = searchQuery.trim();
            const url = q
              ? `/${locale}/search?q=${encodeURIComponent(q)}`
              : `/${locale}/search`;
            router.replace(url);
          }}
        >
          <svg
            className="w-5 h-5 text-black flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('placeholder')}
            className="flex-1 text-black outline-none bg-transparent"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              letterSpacing: '0.02em',
            }}
            autoFocus
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ ...labelStyle, fontWeight: 400, color: '#999' }}
              className="hover:text-black transition-colors"
            >
              LIMPIAR
            </button>
          )}
        </form>
      </div>

      {/* Panel de resultados (reusa el mismo componente que el header) */}
      <div className="max-w-7xl mx-auto">
        <SearchPanel
          locale={locale}
          query={searchQuery}
          onSelect={() => {
            /* navegación nativa de Link; no hay overlay que cerrar aquí */
          }}
        />
      </div>
    </div>
  );
}
