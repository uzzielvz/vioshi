import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { getProducts } from "@/lib/products";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const products = await getProducts();
  const newProducts = await getProducts("new");

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-screen w-full">
          <Image
            src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1920&h=1080&fit=crop"
            alt="VIOGI Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-end justify-start p-8 md:p-16">
            <div>
              <h1
                className="text-white text-4xl md:text-6xl font-bold mb-4 uppercase tracking-wide"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}
              >
                NEW DROP
              </h1>
              <Link
                href="/collections/new"
                className="inline-block bg-white text-black px-8 py-3 text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 500
                }}
              >
                Shop Now
              </Link>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="px-4 md:px-8 py-16 md:py-24">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2
              className="text-xs uppercase tracking-wide"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              New Arrivals
            </h2>
            <Link
              href="/collections/new"
              className="text-xs uppercase tracking-wide hover:opacity-60 transition-opacity"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              View All
            </Link>
          </div>
          <ProductGrid products={newProducts.slice(0, 4)} />
        </section>

        {/* Featured Image */}
        <section className="relative h-[70vh] w-full">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop"
            alt="VIOGI Collection"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Link
              href="/collections/all"
              className="bg-white text-black px-12 py-4 text-xs uppercase tracking-wide hover:bg-black hover:text-white transition-colors"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              Shop Collection
            </Link>
          </div>
        </section>

        {/* All Products */}
        <section className="px-4 md:px-8 py-16 md:py-24">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <h2
              className="text-xs uppercase tracking-wide"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              Shop All
            </h2>
            <Link
              href="/collections/all"
              className="text-xs uppercase tracking-wide hover:opacity-60 transition-opacity"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              View All
            </Link>
          </div>
          <ProductGrid products={products.slice(0, 8)} />
        </section>

        {/* Brand Story */}
        <section className="px-4 md:px-8 py-16 md:py-24 bg-black text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2
              className="text-2xl md:text-3xl font-normal mb-6 uppercase tracking-wide"
              style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }}
            >
              Premium Accessible Streetwear
            </h2>
            <p
              className="text-sm mb-8 opacity-80 leading-relaxed"
              style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif" }}
            >
              VIOGI nace en México con una visión clara: crear ropa de calidad premium
              a precios accesibles. Cada pieza está diseñada para durar y trascender temporadas.
            </p>
            <Link
              href="/pages/chapters"
              className="inline-block border border-white text-white px-8 py-3 text-xs uppercase tracking-wide hover:bg-white hover:text-black transition-colors"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              Nuestra Historia
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
