import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";
import { getTranslations } from "next-intl/server";

const categoryNames: Record<string, { es: string; en: string }> = {
  all:        { es: "Todos los Productos", en: "All Products" },
  new:        { es: "Nuevo Drop",          en: "New Drop" },
  hoodie:     { es: "Hoodies",             en: "Hoodies" },
  chamarra:   { es: "Chamarras",           en: "Jackets" },
  pants:      { es: "Pants",               en: "Pants" },
  jeans:      { es: "Jeans",               en: "Jeans" },
  camisas:    { es: "Camisas",             en: "Shirts" },
  playeras:   { es: "Playeras",            en: "Tees" },
  accesorios: { es: "Accesorios",          en: "Accessories" },
  bolsos:     { es: "Bolsos",              en: "Bags" },
};

export default async function CategoryPage({
  params,
}: {
  params: { category: string; locale: string };
}) {
  const { category, locale } = params;
  const t = await getTranslations("pages.collections");
  const products = await getProducts(category === "all" ? undefined : category);
  const names = categoryNames[category];
  const categoryName = names
    ? names[locale as "es" | "en"] ?? names.en
    : locale === "es" ? "Productos" : "Products";

  return (
    <div className="px-4 md:px-8 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8 md:mb-12">
        <h1
          className="uppercase tracking-wide"
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            fontSize: "11px",
            fontWeight: 500,
          }}
        >
          {categoryName}
        </h1>
        <p
          className="text-gray-500"
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            fontSize: "11px",
          }}
        >
          {t("product_count", { count: products.length })}
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
