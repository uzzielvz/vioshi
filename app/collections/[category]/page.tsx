import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";

const categoryNames: Record<string, string> = {
  all: "Todos los Productos",
  new: "Nuevo Drop",
  hoodie: "Hoodies",
  chamarra: "Chamarras",
  pants: "Pants",
  jeans: "Jeans",
  camisas: "Camisas",
  playeras: "Playeras",
  accesorios: "Accesorios",
  bolsos: "Bolsos",
  tees: "Playeras",
  outerwear: "Outerwear",
  accessories: "Accesorios",
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
      <main className="flex-1 pt-[64px]">
        <div className="px-6 md:px-8 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 md:mb-12 tracking-wide uppercase">
            {categoryName}
          </h1>
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
