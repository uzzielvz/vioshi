"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { getProductBySlug, getProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import { useCart } from "@/store/cartStore";
import { generateId } from "@/lib/utils";
import { useState, useEffect } from "react";
import Link from "next/link";

const sizes = ["S", "M", "L", "XL"];

export default function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      const p = await getProductBySlug(params.slug);
      if (p) {
        setProduct(p);
        const all = await getProducts(p.category);
        setRelatedProducts(all.filter(item => item.id !== p.id).slice(0, 4));
      }
    };
    loadProduct();
  }, [params.slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 pt-14 flex items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;

    setIsAdding(true);
    addItem({
      id: generateId(),
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
      image: product.image,
      slug: product.slug,
      size: selectedSize,
    });

    setTimeout(() => setIsAdding(false), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-14">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[3/4] md:aspect-auto md:h-[calc(100vh-56px)] bg-[#F5F5F5]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.isNew && (
              <div
                className="absolute top-4 left-4"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '10px',
                  fontWeight: 500
                }}
              >
                <span className="bg-black text-white px-2 py-1 uppercase tracking-wide">
                  New
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 md:p-12 flex flex-col justify-center">
            <h1
              className="uppercase tracking-wide mb-2"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              {product.name}
            </h1>

            <p
              className="mb-6"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '13px',
                fontWeight: 400
              }}
            >
              ${product.price.toLocaleString()} MXN
            </p>

            {product.description && (
              <p
                className="text-gray-600 mb-8 leading-relaxed"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '12px'
                }}
              >
                {product.description}
              </p>
            )}

            {/* Size Selector */}
            {!product.soldOut && (
              <div className="mb-6">
                <p
                  className="uppercase tracking-wide mb-3"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 500
                  }}
                >
                  Size
                </p>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 border transition-colors ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-black"
                      }`}
                      style={{
                        fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                        fontSize: '11px',
                        fontWeight: 500
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            {product.soldOut ? (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-500 py-4 uppercase tracking-wide cursor-not-allowed"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 500
                }}
              >
                Sold Out
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || isAdding}
                className={`w-full py-4 uppercase tracking-wide transition-colors ${
                  selectedSize
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 500
                }}
              >
                {isAdding ? "Added to Cart" : selectedSize ? "Add to Cart" : "Select Size"}
              </button>
            )}

            {/* Details */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="space-y-4">
                <details className="group">
                  <summary
                    className="flex justify-between items-center cursor-pointer uppercase tracking-wide"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '11px',
                      fontWeight: 500
                    }}
                  >
                    Details
                    <span className="group-open:rotate-180 transition-transform">+</span>
                  </summary>
                  <p
                    className="mt-4 text-gray-600 leading-relaxed"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '12px'
                    }}
                  >
                    {product.description || "Premium quality streetwear made in Mexico. 100% cotton, pre-shrunk fabric."}
                  </p>
                </details>

                <details className="group">
                  <summary
                    className="flex justify-between items-center cursor-pointer uppercase tracking-wide"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '11px',
                      fontWeight: 500
                    }}
                  >
                    Shipping
                    <span className="group-open:rotate-180 transition-transform">+</span>
                  </summary>
                  <p
                    className="mt-4 text-gray-600 leading-relaxed"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '12px'
                    }}
                  >
                    Free shipping on orders over $1,500 MXN. Standard delivery 3-7 business days.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="px-4 md:px-8 py-16 md:py-24 border-t border-gray-200">
            <h2
              className="uppercase tracking-wide mb-8"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((item) => (
                <Link key={item.id} href={`/products/${item.slug}`} className="group">
                  <div className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden mb-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3
                    className="uppercase tracking-wide hover:opacity-60 transition-opacity"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '11px',
                      fontWeight: 500
                    }}
                  >
                    {item.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '11px',
                      fontWeight: 400
                    }}
                  >
                    ${item.price.toLocaleString()} MXN
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
