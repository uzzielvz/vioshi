"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useCart } from "@/store/cartStore";
import { useState, useEffect } from "react";
import { getProductBySlug, Product } from "@/lib/products";
import { notFound } from "next/navigation";

export default function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    async function loadProduct() {
      const prod = await getProductBySlug(params.slug);
      if (!prod) {
        notFound();
      }
      setProduct(prod);
      
      // Set default size and color if available
      if (prod.variants?.size && prod.variants.size.length > 0) {
        setSelectedSize(prod.variants.size[0]);
      }
      if (prod.variants?.color && prod.variants.color.length > 0) {
        setSelectedColor(prod.variants.color[0]);
      }
    }
    loadProduct();
  }, [params.slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      image: product.image,
      slug: product.slug,
    });

    setTimeout(() => {
      setIsAdding(false);
      // No redirigir, el usuario puede abrir el carrito desde el header
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F5]">
      <Header />
      <main className="flex-1 pt-[56px]">
        <div className="px-8 py-12 md:px-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Imagen del producto */}
            <div className="relative aspect-square bg-white">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Información del producto */}
            <div className="flex flex-col justify-start">
              <h1 
                className="mb-6 uppercase"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '24px',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  fontStretch: 'condensed'
                }}
              >
                {product.name}
              </h1>

              {product.description && (
                <p 
                  className="mb-6 text-gray-700"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}
                >
                  {product.description}
                </p>
              )}

              <div className="mb-8">
                <p 
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em'
                  }}
                >
                  ${product.price.toFixed(2)} MXN
                </p>
              </div>

              {/* Selector de talla */}
              {product.variants?.size && product.variants.size.length > 0 && (
                <div className="mb-6">
                  <label 
                    className="block mb-3 uppercase"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                      fontStretch: 'condensed'
                    }}
                  >
                    Talla: {selectedSize}
                  </label>
                  <div className="flex gap-2">
                    {product.variants.size.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border transition-all ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-black hover:border-black'
                        }`}
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '-0.01em',
                          fontStretch: 'condensed',
                          textTransform: 'uppercase'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de color */}
              {product.variants?.color && product.variants.color.length > 0 && (
                <div className="mb-8">
                  <label 
                    className="block mb-3 uppercase"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                      fontStretch: 'condensed'
                    }}
                  >
                    Color: {selectedColor}
                  </label>
                  <div className="flex gap-2">
                    {product.variants.color.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 border transition-all ${
                          selectedColor === color
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-black hover:border-black'
                        }`}
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '-0.01em',
                          fontStretch: 'condensed',
                          textTransform: 'uppercase'
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selector de cantidad */}
              <div className="mb-8">
                <label 
                  className="block mb-3 uppercase"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    fontStretch: 'condensed'
                  }}
                >
                  Cantidad
                </label>
                <div className="flex items-center border border-black w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      fontWeight: 700
                    }}
                  >
                    -
                  </button>
                  <span 
                    className="px-6 py-2 border-x border-black"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      fontWeight: 700
                    }}
                  >
                    {quantity}
                  </button>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '14px',
                      fontWeight: 700
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botón Add to Cart */}
              {product.soldOut ? (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-4 px-6 cursor-not-allowed uppercase"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    fontStretch: 'condensed'
                  }}
                >
                  Sold Out
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full bg-black text-white py-4 px-6 hover:bg-gray-800 transition-colors uppercase disabled:opacity-50"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    fontStretch: 'condensed'
                  }}
                >
                  {isAdding ? 'Agregando...' : 'Agregar al carrito'}
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
