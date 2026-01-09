import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";

const categoryNames: Record<string, string> = {
  all: "Nuevos Lanzamientos",
  new: "Nuevos Lanzamientos",
  tees: "Camisetas",
  sweats: "Sudaderas",
  outerwear: "Abrigos",
  shorts: "Shorts",
  denim: "Denim",
  accessories: "Accesorios",
  pants: "Pantalones",
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
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[56px]">
        <div className="px-4 py-8 md:py-12">
          {/* Título solo visible en móvil */}
          <h1 
            className="md:hidden mb-8 uppercase"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
            }}
          >
            {categoryName}
          </h1>
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
