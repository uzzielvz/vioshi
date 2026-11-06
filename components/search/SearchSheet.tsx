'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CameraIcon, CloseIcon, SearchIcon } from '@/components/ui/icons';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { getSearchBrandsAction } from '@/lib/search/actions';
import {
  forgetSearch,
  getRecentProducts,
  getRecentSearches,
  rememberSearch,
  type RecentProduct,
} from '@/lib/search/recent';

const sectionTitle = 'px-4 pb-1.5 text-[15px] font-bold tracking-[-0.01em] text-ink';
const row = 'flex h-11 w-full items-center px-4 text-left text-[15px] text-ink';

// Phone search screen, after Grailed: what you looked at, what you searched and
// the brands. The field takes the header's place at the top: a field pinned
// above the keyboard is fragile on iOS and could leave fixed bars misplaced.
export default function SearchSheet({ onClose, onCamera }: { onClose: () => void; onCamera: () => void }) {
  const t = useTranslations('ui.search');
  const tNav = useTranslations('ui.nav');
  const router = useRouter();
  const { locale } = useLocaleContext();

  const [query, setQuery] = useState('');
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    setRecentProducts(getRecentProducts());
    setRecentSearches(getRecentSearches());
    let active = true;
    getSearchBrandsAction()
      .then((list) => active && setBrands(list))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Blur first so iOS closes the keyboard and lays the page out again before
  // this screen goes away.
  const close = useCallback(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    onClose();
  }, [onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [close]);

  const q = query.trim();
  const brandRows = useMemo(() => {
    if (!q) return brands.slice(0, 12);
    const needle = q.toLowerCase();
    return brands.filter((b) => b.toLowerCase().includes(needle)).slice(0, 8);
  }, [brands, q]);

  function go(href: string) {
    close();
    router.push(href);
  }

  function searchFor(text: string) {
    rememberSearch(text);
    go(`/${locale}/search?q=${encodeURIComponent(text)}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (q) searchFor(q);
  }

  const brandList = brandRows.length > 0 && (
    <ul>
      {brandRows.map((brand) => (
        <li key={brand}>
          <button type="button" className={row} onClick={() => go(`/${locale}/search?brand=${encodeURIComponent(brand)}`)}>
            {brand}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label={t('title')} className="vs-fade-in fixed inset-0 z-50 flex flex-col bg-paper md:hidden">
      <form onSubmit={submit} role="search" className="flex h-14 flex-none items-center gap-3 border-b border-line px-4">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-btn bg-carton pl-3 pr-1">
          <SearchIcon className="h-[17px] w-[17px] flex-none text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tNav('search_placeholder')}
            aria-label={tNav('search')}
            enterKeyHint="search"
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('clear_query')}
              className="grid h-8 w-8 flex-none place-items-center text-muted"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              (document.activeElement as HTMLElement | null)?.blur();
              onCamera();
            }}
            aria-label={tNav('visual_search')}
            className="grid h-8 w-8 flex-none place-items-center text-ink"
          >
            <CameraIcon className="h-5 w-5" />
          </button>
        </div>
        <button type="button" onClick={close} className="flex-none text-[14px] font-semibold text-ink">
          {tNav('cancel')}
        </button>
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
        {q ? (
          <>
            <button type="button" className={`${row} gap-3 font-semibold`} onClick={() => searchFor(q)}>
              <SearchIcon className="h-[18px] w-[18px] flex-none text-muted" />
              <span className="truncate">{t('search_for', { query: q })}</span>
            </button>
            {brandRows.length > 0 && (
              <section className="pt-5">
                <h2 className={sectionTitle}>{t('brands_title')}</h2>
                {brandList}
              </section>
            )}
          </>
        ) : (
          <div className="grid gap-6">
            {recentProducts.length > 0 && (
              <section>
                <h2 className={`${sectionTitle} pb-2.5`}>{t('recently_viewed')}</h2>
                <ul className="flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {recentProducts.map((product) => (
                    <li key={product.id} className="w-[108px] flex-none">
                      <button
                        type="button"
                        onClick={() => go(`/${locale}/products/${product.slug}`)}
                        aria-label={product.brand ? `${product.brand} · ${product.name}` : product.name}
                        className="relative block aspect-[3/4] w-full overflow-hidden bg-carton"
                      >
                        <Image src={product.image} alt="" fill sizes="108px" className="object-cover mix-blend-multiply" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {recentSearches.length > 0 && (
              <section>
                <h2 className={sectionTitle}>{t('recent_searches')}</h2>
                <ul>
                  {recentSearches.map((text) => (
                    <li key={text} className="flex items-center">
                      <button type="button" className={`${row} min-w-0 flex-1`} onClick={() => searchFor(text)}>
                        <span className="truncate">{text}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecentSearches(forgetSearch(text))}
                        aria-label={t('remove_recent', { query: text })}
                        className="mr-1 grid h-11 w-11 flex-none place-items-center text-ink"
                      >
                        <CloseIcon className="h-[18px] w-[18px]" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {brandRows.length > 0 && (
              <section>
                <h2 className={sectionTitle}>{t('brands_title')}</h2>
                {brandList}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
