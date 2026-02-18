import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";

const categoryNames: Record<string, string> = {
  all: "All Products",
  new: "New Drop",
  hoodie: "Hoodies",
  chamarra: "Chamarras",
  pants: "Pants",
  jeans: "Jeans",
  camisas: "Camisas",
  playeras: "Playeras",
  accesorios: "Accesorios",
  bolsos: "Bolsos",
};

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = params.category === "all" ? undefined : params.category;
  const products = await getProducts(category);
  const categoryName = categoryNames[params.category] || "Products";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-14">
        <div className="px-4 md:px-8 py-8 md:py-12">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h1
              className="uppercase tracking-wide"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              {categoryName}
            </h1>
            <p
              className="text-gray-500"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px'
              }}
            >
              {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </p>
          </div>
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
