import CategoryTabs from "@/components/CategoryTabs";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";
import { getTranslations } from "next-intl/server";

export default async function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const [products, t] = await Promise.all([
    getProducts(),
    getTranslations("ui.home"),
  ]);

  return (
    <div className="bg-paper">
      <div className="flex items-baseline justify-between gap-3 px-3.5 pb-1 pt-4 md:px-8">
        <h1 className="text-[17px] font-bold tracking-[-0.01em] text-ink">{t("title")}</h1>
        <p className="text-[12px] text-muted">{t("count", { count: products.length })}</p>
      </div>
      <CategoryTabs locale={locale} active="all" />
      <section className="px-0 py-4 md:px-8">
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
