import CategoryTabs from "@/components/CategoryTabs";
import ProductGrid from "@/components/ProductGrid";
import { STORE_CATEGORIES, type StoreCategory } from "@/lib/categories";
import { getProducts } from "@/lib/products";
import { getTranslations } from "next-intl/server";

function isStoreCategory(value: string): value is StoreCategory {
  return (STORE_CATEGORIES as readonly string[]).includes(value);
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string; locale: string };
}) {
  const { category, locale } = params;
  const [products, tHome, tCats] = await Promise.all([
    getProducts(category === "all" ? undefined : category),
    getTranslations("ui.home"),
    getTranslations("ui.cats"),
  ]);

  const title =
    category === "all" || category === "new"
      ? tCats(category)
      : isStoreCategory(category)
        ? tCats(category)
        : category;

  return (
    <div className="bg-paper">
      <div className="flex items-baseline justify-between gap-3 px-3.5 pb-1 pt-4 md:px-8">
        <h1 className="text-[17px] font-bold tracking-[-0.01em] text-ink">{title}</h1>
        <p className="text-[12px] text-muted">{tHome("count", { count: products.length })}</p>
      </div>
      <CategoryTabs locale={locale} active={category} />
      <section className="px-0 py-4 md:px-8">
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
