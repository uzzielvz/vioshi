'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export type SortKey = 'newest' | 'price_asc' | 'price_desc';

interface SearchFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  sort: SortKey;
  category: string;
  onChange: (next: { sort: SortKey; category: string }) => void;
}

const CATEGORIES = [
  'all',
  'hoodie',
  'chamarra',
  'pants',
  'jeans',
  'playeras',
  'camisas',
  'accesorios',
  'bolsos',
];

const labelStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '0.02em',
};

export default function SearchFilterDrawer({
  open,
  onClose,
  sort,
  category,
  onChange,
}: SearchFilterDrawerProps) {
  const t = useTranslations('search');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const SORTS: { key: SortKey; labelKey: 'sort_newest' | 'sort_price_asc' | 'sort_price_desc' }[] = [
    { key: 'newest', labelKey: 'sort_newest' },
    { key: 'price_asc', labelKey: 'sort_price_asc' },
    { key: 'price_desc', labelKey: 'sort_price_desc' },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0, 0, 0, 0.4)' }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full z-[61] bg-white shadow-xl transition-transform duration-300 ease-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: 'min(420px, 100vw)' }}
        role="dialog"
        aria-modal="true"
        aria-label={t('filter')}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <h2 style={sectionTitleStyle}>{t('filter')}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
          {/* Ordenar por */}
          <section>
            <h3 style={sectionTitleStyle} className="mb-4">
              {t('sort_by')}
            </h3>
            <ul className="space-y-3">
              {SORTS.map((s) => {
                const active = sort === s.key;
                return (
                  <li key={s.key}>
                    <button
                      type="button"
                      onClick={() => onChange({ sort: s.key, category })}
                      className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
                    >
                      <span
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: active ? '#000' : 'rgba(0,0,0,0.3)' }}
                      >
                        {active && (
                          <span className="w-2.5 h-2.5 rounded-full bg-black" />
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '13px',
                          fontWeight: 400,
                        }}
                      >
                        {t(s.labelKey)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="border-t" style={{ borderColor: 'rgba(0,0,0,0.08)' }} />

          {/* Categoría */}
          <section>
            <h3 style={sectionTitleStyle} className="mb-4">
              {t('category')}
            </h3>
            <ul className="space-y-3">
              {CATEGORIES.map((c) => {
                const active = category === c;
                return (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => onChange({ sort, category: c })}
                      className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
                    >
                      <span
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: active ? '#000' : 'rgba(0,0,0,0.3)' }}
                      >
                        {active && (
                          <span className="w-2.5 h-2.5 rounded-full bg-black" />
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '13px',
                          fontWeight: 400,
                        }}
                      >
                        {t(`categories.${c}` as 'categories.all')}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Footer: Aplicar (cierra el drawer; los cambios ya se aplicaron en vivo) */}
        <div
          className="px-6 py-4 border-t"
          style={{ borderColor: 'rgba(0,0,0,0.08)' }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-black text-white py-3 hover:opacity-80 transition-opacity"
            style={{ ...labelStyle, color: '#fff' }}
          >
            {t('apply')}
          </button>
        </div>
      </aside>
    </>
  );
}
