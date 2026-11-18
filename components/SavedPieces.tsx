"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { useWishlist } from "@/hooks/useWishlist";
import type { ProductData } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";
import { HeartIcon } from "@/components/ui/icons";
import { textLinkClass } from "@/components/ui/styles";

// Saved pieces live in localStorage and, with a session, in wishlist_items
// (useWishlist keeps both in step), so the list is built on the client.
export default function SavedPieces({ products }: { products: ProductData[] }) {
  const t = useTranslations("ui.saved");
  const { locale } = useLocaleContext();
  const { ids, ready, synced } = useWishlist();

  if (!ready) return <div className="min-h-[40vh]" aria-busy="true" />;

  const byId = new Map(products.map((p) => [p.id, p]));
  // Newest saved first.
  const saved = [...ids]
    .reverse()
    .map((id) => byId.get(id))
    .filter((p): p is ProductData => Boolean(p));

  if (saved.length === 0) {
    return (
      <div className="mx-auto grid max-w-[320px] justify-items-center gap-2.5 px-4 py-12 text-center">
        <HeartIcon className="h-5 w-5 text-muted" />
        <p className="text-[13.5px] leading-snug text-muted">{t("empty_title")}</p>
        <Link
          href={`/${locale}`}
          className={`${textLinkClass} text-[11.5px] uppercase tracking-[0.1em]`}
        >
          {t("explore")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 pb-3 md:px-0">
        <p className="text-[13px] font-semibold tabular-nums text-ink">{t("count", { count: saved.length })}</p>
        <p className="text-[12px] text-muted">{synced ? t("account_note") : t("device_note")}</p>
      </div>
      <ProductGrid products={saved} />
    </div>
  );
}
