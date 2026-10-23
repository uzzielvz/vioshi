"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { useCart } from "@/store/cartStore";
import { BagIcon, HomeIcon, SearchIcon, SellIcon, UserIcon } from "@/components/ui/icons";

// App-style navigation for phones. Desktop uses the header instead.
export default function BottomNav() {
  const t = useTranslations("ui.nav");
  const { locale } = useLocaleContext();
  const pathname = usePathname();
  const { itemCount, openCart, isCartOpen } = useCart();
  const path = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";

  const item = "grid justify-items-center gap-[3px] pt-2 text-[10px] font-medium text-muted";
  const active = "font-semibold text-ink";

  const links = [
    { href: `/${locale}`, label: t("home"), Icon: HomeIcon, on: path === "/" || path.startsWith("/collections") },
    { href: `/${locale}/search`, label: t("search"), Icon: SearchIcon, on: path.startsWith("/search") || path.startsWith("/visual-search") },
    { href: `/${locale}/vender`, label: t("sell"), Icon: SellIcon, on: path.startsWith("/vender") },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper pb-[max(6px,env(safe-area-inset-bottom))] md:hidden"
      aria-label={t("menu")}
    >
      {links.map(({ href, label, Icon, on }) => (
        <Link key={href} href={href} className={clsx(item, on && active)} aria-current={on ? "page" : undefined}>
          <Icon className="h-[22px] w-[22px]" />
          {label}
        </Link>
      ))}
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
