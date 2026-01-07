import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { getProductBySlug } from "@/lib/products";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1">
        <div className="px-6 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            <div className="relative aspect-square bg-white">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl font-normal mb-4 tracking-wide uppercase">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-sm text-gray-600 mb-6">{product.description}</p>
              )}
              <div className="mb-8">
                <p className="text-lg font-normal">${product.price}</p>
              </div>
              {product.soldOut ? (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 px-6 cursor-not-allowed text-sm uppercase tracking-wide"
                >
                  SOLD OUT
                </button>
              ) : (
                <button className="w-full bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors text-sm uppercase tracking-wide">
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
