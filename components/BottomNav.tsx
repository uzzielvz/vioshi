"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { useCart } from "@/store/cartStore";
import { BagIcon, HomeIcon, SearchIcon, SellIcon, UserIcon } from "@/components/ui/icons";
import { OPEN_SEARCH_EVENT } from "@/components/Header";

// App-style navigation for phones. Desktop uses the header instead.
export default function BottomNav() {
  const t = useTranslations("ui.nav");
  const { locale } = useLocaleContext();
  const pathname = usePathname();
  const { itemCount, openCart, isCartOpen } = useCart();
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  const item = "grid justify-items-center gap-[3px] pt-2 text-[10px] font-medium text-muted";
  const active = "font-semibold text-ink";

  const searching = path.startsWith("/search") || path.startsWith("/visual-search");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper pb-[max(6px,env(safe-area-inset-bottom))] md:hidden"
      aria-label={t("menu")}
    >
      <Link
        href={`/${locale}`}
        className={clsx(item, (path === "/" || path.startsWith("/collections")) && active)}
        aria-current={path === "/" ? "page" : undefined}
      >
        <HomeIcon className="h-[22px] w-[22px]" />
        {t("home")}
      </Link>
      {/* Opens the search screen (Header) instead of a page. */}
      <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))} className={clsx(item, searching && active)}>
        <SearchIcon className="h-[22px] w-[22px]" />
        {t("search")}
      </button>
      <Link
        href={`/${locale}/vender`}
        className={clsx(item, path.startsWith("/vender") && active)}
        aria-current={path.startsWith("/vender") ? "page" : undefined}
      >
        <SellIcon className="h-[22px] w-[22px]" />
        {t("sell")}
      </Link>
      <button type="button" onClick={openCart} className={clsx(item, isCartOpen && active)} aria-label={t("bag_count", { count: itemCount })}>
        <span className="relative">
          <BagIcon className="h-[22px] w-[22px]" />
          {itemCount > 0 && (
            <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-paper">
              {itemCount}
            </span>
          )}
        </span>
        {t("bag")}
      </button>
      <Link
        href={`/${locale}/account`}
        className={clsx(item, (path.startsWith("/account") || path.startsWith("/wishlist")) && active)}
      >
        <UserIcon className="h-[22px] w-[22px]" />
        {t("account")}
      </Link>
    </nav>
  );
}
