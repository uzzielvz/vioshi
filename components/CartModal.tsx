"use client";

import { useCart } from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, itemCount, removeItem, updateQuantity } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay oscuro solo en desktop */}
      <div 
        className="hidden md:block fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Panel del carrito */}
      <div 
        className="fixed right-0 top-0 h-full bg-white z-50 flex flex-col"
        style={{
          width: '100%',
          maxWidth: '100vw'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Estilos responsive para desktop */}
        <style jsx>{`
          @media (min-width: 768px) {
            div[style*="width: 100%"] {
              width: 500px !important;
              max-width: 500px !important;
              box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
            }
          }
        `}</style>

        {/* Header del carrito */}
        <div 
          className="flex items-center justify-between px-8 py-6 border-b"
          style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
        >
          <h2 
            className="uppercase"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              fontStretch: 'condensed'
            }}
          >
            Shopping Bag
          </h2>
          
          <button
            onClick={onClose}
            className="text-black hover:opacity-60 transition-opacity"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="flex-1 overflow-y-auto">
          {itemCount === 0 ? (
            // Carrito vacío
            <div className="px-8 py-12">
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
                className="uppercase"
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
          ) : (
            // Lista de productos
            <div className="px-8 py-6">
              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-6 border-b"
                    style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
                  >
                    {/* Imagen del producto */}
                    <Link 
                      href={`/products/${item.slug || item.productId}`}
                      onClick={onClose}
                      className="relative w-24 h-24 bg-gray-100 flex-shrink-0"
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
                        <Link 
                          href={`/products/${item.slug || item.productId}`}
                          onClick={onClose}
                        >
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
                          className="mb-3 text-gray-600"
                          style={{
                            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                            fontSize: '10px',
                            letterSpacing: '-0.01em'
                          }}
                        >
                          {item.color && <span>Color: {item.color}</span>}
                          {item.color && item.size && <span className="mx-1">/</span>}
                          {item.size && <span>Size: {item.size}</span>}
                        </p>
                      )}

                      {/* Precio y cantidad */}
                      <div className="flex items-center justify-between mt-auto">
                        {/* Selector de cantidad */}
                        <div className="flex items-center border border-black">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-100 transition-colors"
                            style={{
                              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            -
                          </button>
                          <span 
                            className="px-3 py-1 border-x border-black"
                            style={{
                              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-100 transition-colors"
                            style={{
                              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                              fontSize: '11px',
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
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '-0.01em'
                          }}
                        >
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con resumen y botones */}
        {itemCount > 0 && (
          <div 
            className="border-t px-8 py-6"
            style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
          >
            {/* Resumen */}
            <div className="space-y-3 mb-6">
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

              <div className="border-t pt-3" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
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
                      fontSize: '13px',
                      fontWeight: 800,
                      letterSpacing: '-0.01em'
                    }}
                  >
                    ${cart.total.toFixed(2)} MXN
                  </span>
                </div>
              </div>
            </div>

            {/* Mensaje de envío gratis */}
            {cart.subtotal < 1500 && (
              <p 
                className="mb-4 text-gray-600 text-center"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '10px',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.4'
                }}
              >
                Agrega ${(1500 - cart.subtotal).toFixed(2)} MXN más para obtener envío gratis
              </p>
            )}

            {/* Botón Checkout */}
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
              Proceed to Checkout
            </button>
          </div>
        )}

        {/* Botón Continue Shopping - solo cuando está vacío */}
        {itemCount === 0 && (
          <div className="border-t px-8 py-6" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
            <button
              onClick={onClose}
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
          </div>
        )}
      </div>
    </>
  );
}

