import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";

export default async function NewDropPage() {
  const products = await getProducts();
  // Filtrar solo productos nuevos (puedes ajustar la lógica)
  const newProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[56px]">
        <div className="px-6 md:px-8 py-8 md:py-12">
          <h1 
            className="mb-8 md:mb-12 uppercase"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.1em'
            }}
          >
            Nuevo Drop
          </h1>
          <ProductGrid products={newProducts} />
        </div>
      </main>
      <Footer />
    </div>
  );
}

