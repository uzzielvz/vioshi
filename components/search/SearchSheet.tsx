'use client';

import { useEffect, useMemo, useState } from 'react';
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
// the brands, with the field floating at the bottom, above the keyboard.
export default function SearchSheet({ onClose, onCamera }: { onClose: () => void; onCamera: () => void }) {
  const t = useTranslations('ui.search');
  const tNav = useTranslations('ui.nav');
  const router = useRouter();
  const { locale } = useLocaleContext();

  const [query, setQuery] = useState('');
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [keyboard, setKeyboard] = useState(0);

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

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // The layout viewport keeps its height when the keyboard opens (iOS, recent
  // Android), so the bar is lifted by the part the keyboard covers.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setKeyboard(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)));
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  const q = query.trim();
  const brandRows = useMemo(() => {
    if (!q) return brands.slice(0, 12);
    const needle = q.toLowerCase();
    return brands.filter((b) => b.toLowerCase().includes(needle)).slice(0, 8);
  }, [brands, q]);

  function go(href: string) {
    onClose();
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
    <div role="dialog" aria-modal="true" aria-label={t('title')} className="vs-fade-in fixed inset-0 z-50 bg-paper md:hidden">
      <div className="h-full overflow-y-auto overscroll-contain pb-36 pt-[max(18px,env(safe-area-inset-top))]">
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

      <form
        onSubmit={submit}
        role="search"
        style={{ bottom: keyboard }}
        className="fixed inset-x-0 flex items-center gap-2.5 bg-gradient-to-t from-paper via-paper to-paper/0 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-6"
      >
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-line bg-paper pl-4 pr-1.5 shadow-[0_4px_18px_rgba(17,17,17,0.08)]">
          <SearchIcon className="h-[18px] w-[18px] flex-none text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tNav('search_placeholder')}
            aria-label={tNav('search')}
            enterKeyHint="search"
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted"
          />
          <button
            type="button"
            onClick={onCamera}
            aria-label={tNav('visual_search')}
            className="grid h-9 w-9 flex-none place-items-center rounded-full text-ink transition-colors hover:bg-carton"
          >
            <CameraIcon className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close_search')}
          className="grid h-12 w-12 flex-none place-items-center rounded-full border border-line bg-paper text-ink shadow-[0_4px_18px_rgba(17,17,17,0.08)]"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
