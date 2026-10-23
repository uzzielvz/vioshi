"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { useWishlist } from "@/hooks/useWishlist";
import type { ProductData } from "@/lib/products";
import ProductGrid from "@/components/ProductGrid";
import EmptyState from "@/components/ui/EmptyState";
import { HeartIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/styles";

// Saved pieces live in localStorage (useWishlist), so the list is built on the client.
export default function SavedPieces({ products }: { products: ProductData[] }) {
  const t = useTranslations("ui.saved");
  const { locale } = useLocaleContext();
  const { ids, ready } = useWishlist();

  if (!ready) return <div className="min-h-[40vh]" aria-busy="true" />;

  const byId = new Map(products.map((p) => [p.id, p]));
  // Newest saved first.
  const saved = [...ids]
    .reverse()
    .map((id) => byId.get(id))
    .filter((p): p is ProductData => Boolean(p));

  if (saved.length === 0) {
    return (
      <EmptyState icon={<HeartIcon />} title={t("empty_title")} body={t("empty_body")}>
        <Link href={`/${locale}`} className={buttonClass("primary")}>
          {t("explore")}
        </Link>
      </EmptyState>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-4 pb-3 md:px-0">
        <p className="text-[13px] font-semibold tabular-nums text-ink">{t("count", { count: saved.length })}</p>
        <p className="text-[12px] text-muted">{t("device_note")}</p>
      </div>
      <ProductGrid products={saved} />
    </div>
  );
}
