import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[64px]">
        <div className="px-6 md:px-8 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-normal mb-8 md:mb-12 tracking-wide uppercase">
            Todos los Productos
          </h1>
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
