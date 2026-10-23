"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCart } from "@/store/cartStore";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { formatPrice } from "@/lib/formatters";
import { CloseIcon } from "@/components/ui/icons";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeItem } = useCart();
  const t = useTranslations("ui.bag");
  const tNav = useTranslations("ui.nav");
  const { locale } = useLocaleContext();

  if (!isCartOpen) return null;

  const count = cart.items.length;
  const totalLabel = formatPrice(cart.subtotal, locale, false);

  return (
    <>
      <button
        type="button"
        aria-label={tNav("close")}
        onClick={closeCart}
        className="fixed inset-0 z-40 bg-ink/40"
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-paper shadow-2xl animate-slide-in md:w-[420px]">
        <div className="flex h-14 flex-none items-center justify-between border-b border-line px-3.5">
          <h2 className="text-[20px] font-bold tracking-[-0.015em] text-ink">{t("title")}</h2>
          <div className="flex items-center gap-4">
            {count > 0 && <span className="text-[14px] font-semibold text-muted">{t("count", { count })}</span>}
            <button type="button" onClick={closeCart} aria-label={tNav("close")} className="text-ink">
              <CloseIcon className="h-[21px] w-[21px]" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {count === 0 ? (
            <div className="grid justify-items-center gap-3 px-6 py-16 text-center">
              <p className="text-[19px] font-bold tracking-[-0.01em] text-ink">{t("empty")}</p>
              <Link
                href={`/${locale}`}
                onClick={closeCart}
                className="text-[14px] font-semibold text-accent"
              >
                {t("empty_cta")}
              </Link>
            </div>
          ) : (
            <ul>
              {cart.items.map((item) => (
                <li key={item.id} className="flex gap-3 border-b border-line px-3.5 py-3">
                  <Link
                    href={`/${locale}/products/${item.slug || item.productId}`}
                    onClick={closeCart}
                    className="relative h-20 w-16 flex-none overflow-hidden bg-carton"
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
          )}
        </div>

        {count > 0 && (
          <div className="flex-none border-t border-line px-3.5 py-3">
            <div className="flex items-baseline justify-between text-[13.5px] text-ink">
              <span>{t("subtotal")}</span>
              <span className="font-bold tabular-nums">{totalLabel}</span>
            </div>
            <p className="mt-1.5 text-[12.5px] text-muted">{t("delivery_note")}</p>
            <p className="mt-3 bg-carton p-3 text-[12.5px] leading-relaxed text-ink">{t("unique_note")}</p>
            <Link
              href={`/${locale}/checkout`}
              onClick={closeCart}
              className="mt-3 flex h-12 items-center justify-center rounded-btn bg-accent text-[14px] font-semibold text-paper hover:bg-accent-press"
            >
              {t("checkout", { total: totalLabel })}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
