"use client";

import { useCart } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, updateQuantity, removeItem } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* OVERLAY GRIS - Click para cerrar con cursor X */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-black bg-opacity-40 z-40 search-overlay-cursor"
        style={{ cursor: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M18 6L6 18M6 6l12 12' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E\") 12 12, pointer" }}
      />

      {/* CART DRAWER */}
      <div
        className="fixed top-0 right-0 h-full w-full md:w-[540px] bg-white z-50 shadow-2xl flex flex-col animate-slide-in"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200">
          <h2
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            SHOPPING BAG
          </h2>
          <button
            onClick={closeCart}
            className="text-black hover:opacity-60 transition-opacity duration-200"
            style={{
              fontSize: '28px',
              lineHeight: '1',
              fontWeight: '300'
            }}
          >
            ×
          </button>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {cart.items.length === 0 ? (
            <p
              className="text-center text-gray-500 py-12"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                letterSpacing: '0.02em'
              }}
            >
              Your bag is empty
            </p>
          ) : (
            <div className="space-y-8">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-6">
                  {/* IMAGEN */}
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-100 relative">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  {/* INFO */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                          marginBottom: '6px'
                        }}
                      >
                        {item.productName}
                      </h3>
                      <p
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '11px',
                          letterSpacing: '0.02em',
                          color: '#666',
                          textTransform: 'uppercase',
                          marginBottom: '8px'
                        }}
                      >
                        {item.color} / {item.size}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.02em'
                        }}
                      >
                        ${item.price}
                      </p>
                    </div>

                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-200"
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '18px',
                          fontWeight: 300
                        }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value) || 1;
                          updateQuantity(item.id, Math.max(1, newQty));
                        }}
                        className="w-16 h-10 text-center border border-black outline-none"
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                        min="1"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors duration-200"
                        style={{
                          fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                          fontSize: '18px',
                          fontWeight: 300
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SHIPPING INFO */}
          {cart.items.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  fontWeight: 600,
                  lineHeight: '1.5'
                }}
              >
                TAXES AND SHIPPING CALCULATED AT CHECKOUT.
              </p>
              <p
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '10px',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  lineHeight: '1.5',
                  color: '#666'
                }}
              >
                FREE STANDARD SHIPPING IN US FOR ORDERS OVER $200 USD. EXCLUSIONS APPLY.
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 px-8 py-6">
            {/* SUBTOTAL */}
            <div className="flex items-center justify-between mb-6">
              <span
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                SUBTOTAL
              </span>
              <span
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.02em'
                }}
              >
                ${cart.subtotal.toFixed(2)}
              </span>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={closeCart}
                className="flex-1 py-4 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors duration-200"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                CONTINUE SHOPPING
              </button>
              <Link href="/checkout" onClick={closeCart} className="flex-1">
                <button
                  className="w-full py-4 bg-black text-white hover:opacity-80 transition-opacity duration-200"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase'
                  }}
                >
                  CHECKOUT
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
