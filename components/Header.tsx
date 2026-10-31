"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { useCart } from "@/store/cartStore";
import { STORE_CATEGORIES } from "@/lib/categories";
import Wordmark from "@/components/ui/Wordmark";
import { BagIcon, CameraIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/icons";
import SearchSheet from "@/components/search/SearchSheet";
import CameraSheet from "@/components/search/CameraSheet";
import { rememberSearch } from "@/lib/search/recent";

/** BottomNav fires this to open the phone search screen. */
export const OPEN_SEARCH_EVENT = "rail:search-open";
/** /visual-search fires this once it shows the photo. */
const VS_SHOWN_EVENT = "viogi:vs-shown";

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLeaving, setCameraLeaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const leaveTimer = useRef<number | null>(null);

  const path = pathWithoutLocale(pathname);

  // The camera stays open across its own hop to /visual-search.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onOpenSearch = () => setSearchOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenSearch);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpenSearch);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    };
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    rememberSearch(q);
    setQuery("");
    router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
  };

  // Full reload avoids the React removeChild error when next-intl switches locale.
  const switchLocale = (next: "es" | "en") => {
    if (next === locale) return;
    window.location.href = `/${next}${path === "/" ? "" : path}`;
  };

  // The visual search page reads the photo from sessionStorage; the event
  // tells it to reload when we are already on that route. The camera fades
  // out once that page shows the photo (or after a moment, whatever comes first).
  const searchByPhoto = useCallback(async (file: File) => {
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
    const leave = () => {
      window.removeEventListener(VS_SHOWN_EVENT, leave);
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
      setCameraLeaving(true);
      leaveTimer.current = window.setTimeout(() => {
        setCameraOpen(false);
        setCameraLeaving(false);
      }, 520);
    };
    window.addEventListener(VS_SHOWN_EVENT, leave);
    leaveTimer.current = window.setTimeout(leave, 2500);
    router.push(`/${locale}/visual-search`);
    window.dispatchEvent(new Event("viogi:vs-new"));
  }, [locale, router]);

  const openCamera = () => {
    setSearchOpen(false);
    setCameraLeaving(false);
    setCameraOpen(true);
  };
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeCamera = useCallback(() => setCameraOpen(false), []);

  const searchField = () => (
    <form
      onSubmit={submitSearch}
      className="flex h-10 flex-1 items-center gap-2.5 rounded-btn bg-carton px-3"
      role="search"
    >
      <SearchIcon className="h-[17px] w-[17px] flex-none text-muted" />
      <input
        id="header-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("search_placeholder")}
        aria-label={t("search")}
        className="min-w-0 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-muted md:text-[14px]"
      />
      <button type="button" onClick={openCamera} aria-label={t("visual_search")} className="flex-none text-ink">
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

        <div className="hidden max-w-[460px] flex-1 md:flex">{searchField()}</div>

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
            onClick={() => setSearchOpen(true)}
            className="md:hidden"
            aria-label={t("search")}
            aria-expanded={searchOpen}
          >
            <SearchIcon className="h-[22px] w-[22px]" />
          </button>
          <button type="button" onClick={openCamera} className="md:hidden" aria-label={t("visual_search")}>
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

      {searchOpen && <SearchSheet onClose={closeSearch} onCamera={openCamera} />}
      {cameraOpen && <CameraSheet leaving={cameraLeaving} onClose={closeCamera} onPhoto={searchByPhoto} />}

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
