"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCart } from "@/store/cartStore";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { formatPrice } from "@/lib/formatters";

export default function CartPage() {
  const { cart, removeItem } = useCart();
  const { locale } = useLocaleContext();
  const t = useTranslations("ui.bag");

  const count = cart.items.length;
  const totalLabel = formatPrice(cart.subtotal, locale, false);

  return (
    <div className="bg-paper">
      <div className="flex items-baseline justify-between gap-3 px-3.5 pb-2 pt-4 md:px-8">
        <h1 className="text-[20px] font-bold tracking-[-0.015em] text-ink">{t("title")}</h1>
        {count > 0 && <p className="text-[14px] font-semibold text-muted">{t("count", { count })}</p>}
      </div>

      {count === 0 ? (
        <div className="grid justify-items-center gap-3 px-6 py-24 text-center">
          <p className="text-[19px] font-bold tracking-[-0.01em] text-ink">{t("empty")}</p>
          <Link href={`/${locale}`} className="text-[14px] font-semibold text-accent">
            {t("empty_cta")}
          </Link>
        </div>
      ) : (
        <div className="md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-start md:gap-10 md:px-8">
          <ul className="border-t border-line">
            {cart.items.map((item) => (
              <li key={item.id} className="flex gap-3 border-b border-line px-3.5 py-3 md:px-0">
                <Link
                  href={`/${locale}/products/${item.slug || item.productId}`}
                  className="relative h-24 w-16 flex-none overflow-hidden bg-carton"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover mix-blend-multiply"
                      sizes="64px"
                    />
                  ) : null}
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-ink">{item.productName}</p>
                  {item.size ? (
                    <p className="text-[12.5px] text-muted">{t("size", { size: item.size })}</p>
                  ) : null}
                </div>
                <div className="grid content-between justify-items-end">
                  <p className="text-[13px] font-bold tabular-nums text-ink">
                    {formatPrice(item.price, locale, false)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-[12px] text-muted underline"
                  >
                    {t("remove")}
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-3.5 py-4 md:px-0">
            <div className="flex items-baseline justify-between text-[13.5px] text-ink">
              <span>{t("subtotal")}</span>
              <span className="font-bold tabular-nums">{totalLabel}</span>
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted">{t("delivery_note")}</p>
            <p className="mt-3 bg-carton p-3 text-[12.5px] leading-relaxed text-ink">{t("unique_note")}</p>
            <Link
              href={`/${locale}/checkout`}
              className="mt-3 flex h-12 items-center justify-center rounded-btn bg-accent text-[14px] font-semibold text-paper hover:bg-accent-press"
            >
              {t("checkout", { total: totalLabel })}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
