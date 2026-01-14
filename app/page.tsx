import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";
import Link from "next/link";

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero Section - Ultra Minimal */}
        <section className="flex items-center justify-center py-32 md:py-48 px-8">
          <div className="text-center">
            <h1
              className="text-6xl md:text-8xl font-bold mb-12 uppercase tracking-wider"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              VIOGI
            </h1>
            <Link
              href="/collections/all"
              className="inline-block bg-black text-white px-12 py-4 text-xs uppercase tracking-wide hover:opacity-80 transition-opacity"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.05em'
              }}
            >
              SHOP NOW
            </Link>
          </div>
        </section>

        {/* Products Section */}
        <section className="px-8 py-16 md:py-24">
          <ProductGrid products={products} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
