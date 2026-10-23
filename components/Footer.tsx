"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocaleContext } from "@/hooks/useLocaleContext";
import { brand } from "@/lib/brand";
import Wordmark from "@/components/ui/Wordmark";

export default function Footer() {
  const t = useTranslations("ui.footer");
  const { locale } = useLocaleContext();
  const year = new Date().getFullYear();

  const links = [
    { href: `/${locale}/vender`, label: t("sell") },
    { href: `/${locale}/pages/shipping-payments-returns`, label: t("shipping") },
    { href: `/${locale}/pages/size-guide`, label: t("size_guide") },
    { href: `/${locale}/pages/customer-support`, label: t("help") },
    { href: `/${locale}/pages/legal`, label: t("legal") },
  ];

  return (
    <footer className="mt-auto border-t border-line bg-paper text-ink">
      <div className="flex flex-col gap-5 px-4 py-8 md:flex-row md:items-center md:gap-10 md:px-8">
        <Wordmark className="text-[20px]" />
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted" aria-label={brand.name}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
          <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
            {t("instagram")}
          </a>
        </nav>
        <p className="text-[12px] text-muted md:ml-auto" suppressHydrationWarning>
          © {year} {brand.name}
        </p>
      </div>
    </footer>
  );
}
