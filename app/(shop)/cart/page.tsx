"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { cart, itemCount, removeItem, updateQuantity } = useCart();

  // Carrito vacío
  if (itemCount === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 pt-[56px]">
          <div className="px-8 py-12 md:px-32 max-w-4xl">
            {/* Título */}
            <h1 
              className="mb-8 pb-6 border-b uppercase"
              style={{
                borderColor: 'rgba(0, 0, 0, 0.1)',
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                fontStretch: 'condensed'
              }}
            >
              Shopping Bag
            </h1>

            {/* Mensaje de carrito vacío */}
            <div className="py-12">
              <p 
                className="mb-4 uppercase"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em'
                }}
              >
                You have no items in your shopping bag.
              </p>
              
              <p 
                className="mb-8 uppercase"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em'
                }}
              >
                Free standard shipping in MX for orders over $1500 MXN. Exclusions apply.
              </p>
            </div>

            {/* Botón continuar comprando */}
            <div className="mt-auto pt-12">
              <Link href="/collections/all">
                <button
                  className="w-full bg-black text-white py-4 px-6 hover:bg-gray-800 transition-colors uppercase"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    fontStretch: 'condensed'
                  }}
                >
                  Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Carrito con productos
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 pt-[56px]">
        <div className="px-8 py-12 md:px-32 max-w-6xl mx-auto">
          {/* Título */}
          <h1 
            className="mb-8 pb-6 border-b uppercase"
            style={{
              borderColor: 'rgba(0, 0, 0, 0.1)',
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              fontStretch: 'condensed'
            }}
          >
            Shopping Bag
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Lista de productos */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-6 pb-8 border-b"
                    style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
                  >
                    {/* Imagen del producto */}
                    <Link 
                      href={`/products/${item.slug || item.productId}`}
                      className="relative w-32 h-32 md:w-40 md:h-40 bg-gray-100 flex-shrink-0"
                    >
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Información del producto */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between mb-2">
                        <Link href={`/products/${item.slug || item.productId}`}>
                          <h3 
                            className="uppercase hover:opacity-60 transition-opacity"
                            style={{
                              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                              fontSize: '11px',
                              fontWeight: 800,
                              letterSpacing: '-0.01em',
                              fontStretch: 'condensed'
                            }}
                          >
                            {item.productName}
                          </h3>
                        </Link>
                        
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-500 hover:text-black transition-colors"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth={2} 
                            stroke="currentColor" 
                            className="w-4 h-4"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Variantes */}
                      {(item.color || item.size) && (
                        <p 
                          className="mb-4 text-gray-600"
                          style={{
                            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                            fontSize: '11px',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {item.color && <span>Color: {item.color}</span>}
                          {item.color && item.size && <span className="mx-2">/</span>}
                          {item.size && <span>Size: {item.size}</span>}
                        </p>
                      )}

                      {/* Precio y cantidad */}
                      <div className="flex items-center justify-between mt-auto">
                        {/* Selector de cantidad */}
                        <div className="flex items-center border border-black">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            style={{
                              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            -
                          </button>
                          <span 
                            className="px-4 py-1 border-x border-black"
                            style={{
                              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                            style={{
                              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                              fontSize: '12px',
                              fontWeight: 700
                            }}
                          >
                            +
                          </button>
                        </div>

                        {/* Precio */}
                        <p 
                          style={{
                            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                            fontSize: '14px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em'
                          }}
                        >
                          ${(item.price * item.quantity).toFixed(2)} MXN
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 p-6">
                <h2 
                  className="mb-6 pb-4 border-b uppercase"
                  style={{
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    fontStretch: 'condensed'
                  }}
                >
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span 
                      className="uppercase"
                      style={{
                        fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '-0.01em'
                      }}
                    >
                      Subtotal
                    </span>
                    <span 
                      style={{
                        fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '-0.01em'
                      }}
                    >
                      ${cart.subtotal.toFixed(2)} MXN
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span 
                      className="uppercase"
                      style={{
                        fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '-0.01em'
                      }}
                    >
                      Shipping
                    </span>
                    <span 
                      style={{
                        fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '-0.01em'
                      }}
                    >
                      {cart.subtotal >= 1500 ? 'FREE' : `$${cart.shipping.toFixed(2)} MXN`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span 
                      className="uppercase"
                      style={{
                        fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                        fontSize: '11px',
                        fontWeight: 400,
                        letterSpacing: '-0.01em'
                      }}
                    >
                      Tax
                    </span>
                    <span 
                      style={{
                        fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '-0.01em'
                      }}
                    >
                      ${cart.tax.toFixed(2)} MXN
                    </span>
                  </div>

                  <div className="border-t pt-4" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                    <div className="flex justify-between">
                      <span 
                        className="uppercase"
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '-0.01em',
                          fontStretch: 'condensed'
                        }}
                      >
                        Total
                      </span>
                      <span 
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '14px',
                          fontWeight: 800,
                          letterSpacing: '-0.01em'
                        }}
                      >
                        ${cart.total.toFixed(2)} MXN
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full bg-black text-white py-4 px-6 mb-4 hover:bg-gray-800 transition-colors uppercase"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                    fontStretch: 'condensed'
                  }}
                >
                  Proceed to Checkout
                </button>

                <Link href="/collections/all">
                  <button
                    className="w-full border border-black bg-white text-black py-4 px-6 hover:bg-gray-50 transition-colors uppercase"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                      fontStretch: 'condensed'
                    }}
                  >
                    Continue Shopping
                  </button>
                </Link>

                {/* Mensaje de envío gratis */}
                {cart.subtotal < 1500 && (
                  <p 
                    className="mt-6 text-gray-600 text-center"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '10px',
                      letterSpacing: '-0.01em',
                      lineHeight: '1.5'
                    }}
                  >
                    Agrega ${(1500 - cart.subtotal).toFixed(2)} MXN más para obtener envío gratis
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
