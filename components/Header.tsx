"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { useCart } from "@/store/cartStore";
import { STORE_CATEGORIES } from "@/lib/categories";
import Wordmark from "@/components/ui/Wordmark";
import { BagIcon, CameraIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";

function pathWithoutLocale(pathname: string): string {
  return pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "") || "/";
}

interface HeaderProps {
  userEmail?: string | null;
}

export default function Header({ userEmail = null }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("ui.nav");
  const tCats = useTranslations("ui.cats");
  const { locale } = useLocaleContext();
  const { itemCount, openCart } = useCart();

  const [query, setQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Always mounted so every camera button can open the picker.
  const photoInputRef = useRef<HTMLInputElement>(null);

  const path = pathWithoutLocale(pathname);

  useEffect(() => {
    setMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setQuery("");
    setMobileSearchOpen(false);
    router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
  };

  // Full reload avoids the React removeChild error when next-intl switches locale.
  const switchLocale = (next: "es" | "en") => {
    if (next === locale) return;
    window.location.href = `/${next}${path === "/" ? "" : path}`;
  };

  // The visual search page reads the photo from sessionStorage; the event
  // tells it to reload when we are already on that route.
  const onPhotoPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      sessionStorage.setItem(
        "__viogi_vs_pending",
        JSON.stringify({ name: file.name, type: file.type, dataUrl })
      );
    } catch {
      // The page shows its own upload state if the handoff fails.
    }
    setMobileSearchOpen(false);
    router.push(`/${locale}/visual-search`);
    window.dispatchEvent(new Event("viogi:vs-new"));
  };

  const openPhotoPicker = () => photoInputRef.current?.click();

  const searchField = (mobile: boolean) => (
    <form
      onSubmit={submitSearch}
      className="flex h-10 flex-1 items-center gap-2.5 rounded-btn bg-carton px-3"
      role="search"
    >
      <SearchIcon className="h-[17px] w-[17px] flex-none text-muted" />
      <input
        id={mobile ? "header-search-mobile" : "header-search"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("search_placeholder")}
        aria-label={t("search")}
        autoFocus={mobile}
        className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted md:text-[14px]"
      />
      <button type="button" onClick={openPhotoPicker} aria-label={t("visual_search")} className="flex-none text-ink">
        <CameraIcon className="h-5 w-5" />
      </button>
    </form>
  );

  const menuLink = (href: string, label: string, active = false) => (
    <Link
      key={href}
      href={href}
      className={clsx("block border-b border-line py-3.5 text-[16px]", active && "font-semibold")}
    >
      {label}
    </Link>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-paper">
      <div className="flex h-14 items-center gap-4 px-4 md:h-16 md:gap-7 md:px-8">
        <Link href={`/${locale}`} className="flex-none text-ink" aria-label={t("home")}>
          <Wordmark className="text-[25px] md:text-[26px]" />
        </Link>

        <div className="hidden max-w-[460px] flex-1 md:flex">{searchField(false)}</div>

        <nav className="ml-auto flex items-center gap-4 md:gap-6" aria-label={t("menu")}>
          <Link href={`/${locale}/vender`} className="hidden text-[14px] font-semibold md:inline">
            {t("sell")}
          </Link>
          <Link href={`/${locale}/account`} className="hidden text-[14px] font-semibold md:inline">
            {userEmail ? t("account") : t("login")}
          </Link>
          <button
            type="button"
            onClick={() => switchLocale(locale === "es" ? "en" : "es")}
            className="hidden text-[13px] font-semibold text-muted md:inline"
            aria-label={t("switch_language")}
          >
            {locale === "es" ? "EN" : "ES"}
          </button>

          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="md:hidden"
            aria-label={t("search")}
            aria-expanded={mobileSearchOpen}
          >
            <SearchIcon className="h-[22px] w-[22px]" />
          </button>
          <button type="button" onClick={openPhotoPicker} className="md:hidden" aria-label={t("visual_search")}>
            <CameraIcon className="h-[22px] w-[22px]" />
          </button>

          <button
            type="button"
            onClick={openCart}
            className="relative hidden md:block"
            aria-label={t("bag_count", { count: itemCount })}
          >
            <BagIcon className="h-[22px] w-[22px]" />
            {itemCount > 0 && (
              <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-paper">
                {itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden"
            aria-label={menuOpen ? t("close") : t("menu")}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon className="h-[22px] w-[22px]" /> : <MenuIcon className="h-[22px] w-[22px]" />}
          </button>
        </nav>
      </div>

      {mobileSearchOpen && (
        <div className="flex items-center gap-3 border-t border-line bg-paper px-4 py-2 md:hidden">
          {searchField(true)}
          <button type="button" onClick={() => setMobileSearchOpen(false)} className="text-[14px] font-semibold text-muted">
            {t("cancel")}
          </button>
        </div>
      )}

      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onPhotoPicked}
        aria-hidden="true"
        tabIndex={-1}
      />

      {menuOpen && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto bg-paper md:hidden">
          <nav className="px-4 pb-24 pt-2" aria-label={t("categories")}>
            <p className="pb-1 pt-4 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">{t("categories")}</p>
            {menuLink(`/${locale}/collections/all`, tCats("all"), path === "/collections/all")}
            {STORE_CATEGORIES.map((slug) =>
              menuLink(`/${locale}/collections/${slug}`, tCats(slug), path === `/collections/${slug}`)
            )}

            <p className="pb-1 pt-6 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">{t("account")}</p>
            {menuLink(`/${locale}/account`, userEmail ? t("account") : t("login"))}
            {menuLink(`/${locale}/wishlist`, t("saved"))}
            {menuLink(`/${locale}/vender`, t("sell"))}
            {menuLink(`/${locale}/pages/customer-support`, t("help"))}

            <p className="pb-2 pt-6 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">{t("language")}</p>
            <div className="grid grid-cols-2 gap-2">
              {(["es", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => switchLocale(l)}
                  aria-pressed={locale === l}
                  className={clsx(
                    "h-11 rounded-btn border text-[14px]",
                    locale === l ? "border-ink font-semibold" : "border-line text-muted"
                  )}
                >
                  {l === "es" ? t("lang_es") : t("lang_en")}
                </button>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
