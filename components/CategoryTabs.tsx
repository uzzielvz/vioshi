import Link from "next/link";
import clsx from "clsx";
import { getTranslations } from "next-intl/server";
import { STORE_CATEGORIES, type StoreCategory } from "@/lib/categories";

type TabSlug = "all" | StoreCategory;

export default async function CategoryTabs({
  locale,
  active,
}: {
  locale: string;
  active?: string;
}) {
  const [t, tNav] = await Promise.all([
    getTranslations("ui.cats"),
    getTranslations("ui.nav"),
  ]);

  const tabs: { slug: TabSlug; href: string }[] = [
    { slug: "all", href: `/${locale}` },
    ...STORE_CATEGORIES.map((slug) => ({
      slug,
      href: `/${locale}/collections/${slug}`,
    })),
  ];

  return (
    <nav
      aria-label={tNav("categories")}
      className="flex max-w-full gap-[18px] overflow-x-auto border-b border-line px-3.5 [scrollbar-width:none] md:px-8 [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const on = tab.slug === active;
        return (
          <Link
            key={tab.slug}
            href={tab.href}
            aria-current={on ? "page" : undefined}
            className={clsx(
              "-mb-px inline-flex h-[42px] flex-none items-center whitespace-nowrap border-b-2 px-px text-[13px]",
              on ? "border-ink font-semibold text-ink" : "border-transparent font-medium text-muted"
            )}
          >
            {t(tab.slug)}
          </Link>
        );
      })}
    </nav>
  );
}
