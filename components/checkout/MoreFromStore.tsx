'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useWishlist } from '@/hooks/useWishlist';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { formatPrice } from '@/lib/formatters';
import { getMorePiecesAction, type MorePiece } from '@/app/[locale]/checkout/actions';

// «Agrega más de Viogi · mismo envío»: the bag's replacement. Other pieces of
// the same store, the buyer's saved ones first, added to this same order.
export default function MoreFromStore({
  productIds,
  onAdd,
}: {
  productIds: string[];
  onAdd: (piece: MorePiece) => void;
}) {
  const t = useTranslations('ui.checkout');
  const { locale } = useLocaleContext();
  const { has } = useWishlist();
  const [result, setResult] = useState<Awaited<ReturnType<typeof getMorePiecesAction>>>(null);

  // The store comes from the first piece; adding more of it doesn't refetch.
  const anchor = productIds[0];
  useEffect(() => {
    if (!anchor) return;
    let active = true;
    getMorePiecesAction([anchor])
      .then((next) => active && setResult(next))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [anchor]);

  const pieces = useMemo(() => {
    const inOrder = new Set(productIds);
    const list = (result?.pieces ?? []).filter((p) => !inOrder.has(p.id));
    return [...list.filter((p) => has(p.id)), ...list.filter((p) => !has(p.id))];
  }, [result, productIds, has]);

  if (!result || pieces.length === 0) return null;

  return (
    <section className="grid gap-2.5" aria-label={t('more_title', { store: result.store.name })}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[14px] font-bold text-ink">{t('more_title', { store: result.store.name })}</h2>
        <span className="text-[12px] text-muted">{t('more_note')}</span>
      </div>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        {pieces.map((piece) => (
          <li key={piece.id} className="grid w-[112px] flex-none content-start gap-1.5">
            <a
              href={`/${locale}/products/${piece.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={piece.brand ? `${piece.brand} · ${piece.name}` : piece.name}
              className="relative block aspect-[3/4] overflow-hidden bg-carton"
            >
              <Image src={piece.image} alt="" fill sizes="112px" className="object-cover mix-blend-multiply" />
              {has(piece.id) && (
                <span className="absolute left-1.5 top-1.5 bg-paper px-1 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] text-ink">
                  {t('more_saved')}
                </span>
              )}
            </a>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-ink">{piece.brand ?? piece.name}</p>
              <p className="text-[12px] tabular-nums text-muted">
                {formatPrice(piece.price, locale, false)}
                {piece.size ? ` · ${piece.size}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onAdd(piece)}
              aria-label={t('more_add_aria', { name: piece.name })}
              className="h-8 rounded-btn border border-ink text-[12.5px] font-semibold text-ink transition-colors hover:bg-carton"
            >
              {t('more_add')}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
