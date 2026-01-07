"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/store/cartStore";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const { itemCount } = useCart();

  // Manejar apertura de SHOP
  const handleShopEnter = () => {
    setShopOpen(true);
    setSupportOpen(false); // Cerrar SOPORTE si está abierto
  };

  // Manejar apertura de SOPORTE
  const handleSupportEnter = () => {
    setSupportOpen(true);
    setShopOpen(false); // Cerrar SHOP si está abierto
  };

  // Manejar cierre de ambos
  const handleMenuLeave = () => {
    setShopOpen(false);
    setSupportOpen(false);
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-40"
      style={{
        background: 'transparent',
        borderBottom: '1px solid rgba(232, 232, 232, 0.3)'
      }}
    >
      {/* ROW 1 - HEADER PRINCIPAL */}
      <div className="flex items-center justify-between px-8 h-14">
        
        {/* LEFT - LOGO SOLAMENTE */}
        <Link 
          href="/" 
          className="text-lg font-bold text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
          style={{ 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'
          }}
        >
          VIOGI
        </Link>

        {/* CENTER - NAVEGACIÓN INDEPENDIENTE */}
        <nav className="hidden md:flex items-center gap-8 absolute left-32">
          
          {/* SHOP */}
          <div 
            onMouseEnter={handleShopEnter}
            onMouseLeave={(e) => {
              // No cerrar si el mouse va hacia el subheader
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (relatedTarget && relatedTarget.closest('[data-submenu="true"]')) {
                return;
              }
              handleMenuLeave();
            }}
          >
            <button 
              className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 flex items-center gap-1"
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              SHOP
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* ARCHIVO */}
          <Link 
            href="/archive" 
            className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
              letterSpacing: '0.05em',
              fontSize: '11px',
              padding: '0',
              margin: '0'
            }}
          >
            ARCHIVO
          </Link>

          {/* SOPORTE */}
          <div 
            onMouseEnter={handleSupportEnter}
            onMouseLeave={(e) => {
              // No cerrar si el mouse va hacia el subheader
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (relatedTarget && relatedTarget.closest('[data-submenu="true"]')) {
                return;
              }
              handleMenuLeave();
            }}
          >
            <button 
              className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 flex items-center gap-1"
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              SOPORTE
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </nav>

        {/* RIGHT SIDE - TEXT */}
        <div className="flex items-center gap-6">
          {/* BUSCAR */}
          <button 
            className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
              letterSpacing: '0.05em',
              fontSize: '11px'
            }}
          >
            BUSCAR
          </button>

          {/* $/MXN */}
          <span 
            className="hidden md:block text-xs font-medium uppercase tracking-wide text-black cursor-pointer hover:opacity-60 transition-opacity duration-200"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
              letterSpacing: '0.05em',
              fontSize: '11px'
            }}
          >
            $ / MXN
          </span>

          {/* CARRITO */}
          <Link 
            href="/cart" 
            className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
              letterSpacing: '0.05em',
              fontSize: '11px'
            }}
          >
            CARRITO
          </Link>

          {/* MENU - Mobile only */}
          <button
            className="md:hidden text-xs font-medium uppercase hover:opacity-60 transition-opacity duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
              letterSpacing: '0.05em',
              fontSize: '11px'
            }}
          >
            MENÚ
          </button>
        </div>
      </div>

      {/* ROW 2 - SUBHEADER (Se expande, NO overlay, SIN border-top) */}
      {(shopOpen || supportOpen) && (
        <div 
          data-submenu="true"
          className="hidden md:flex items-center gap-4 py-3"
          style={{
            background: 'transparent',
            paddingLeft: '128px'
          }}
          onMouseLeave={handleMenuLeave}
        >
          {shopOpen && (
            <>
              <Link 
                href="/collections/new" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px',
                  padding: '0',
                  margin: '0'
                }}
              >
                NUEVOS LANZAMIENTOS
              </Link>
              <Link 
                href="/collections/tees" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                CAMISETAS
              </Link>
              <Link 
                href="/collections/outerwear" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                ABRIGOS
              </Link>
              <Link 
                href="/collections/sweats" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                SUDADERAS
              </Link>
              <Link 
                href="/collections/tops-shirts" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                TOPS & CAMISAS
              </Link>
              <Link 
                href="/collections/knits" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                TEJIDOS
              </Link>
              <Link 
                href="/collections/pants" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                PANTALONES
              </Link>
              <Link 
                href="/collections/shorts" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                SHORTS
              </Link>
              <Link 
                href="/collections/denim" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                DENIM
              </Link>
              <Link 
                href="/collections/headwear" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                GORRAS
              </Link>
              <Link 
                href="/collections/sunglasses" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                LENTES DE SOL
              </Link>
              <Link 
                href="/collections/accessories" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                ACCESORIOS
              </Link>
            </>
          )}

          {supportOpen && (
            <>
              <Link 
                href="/pages/customer-support" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                ATENCIÓN AL CLIENTE
              </Link>
              <Link 
                href="/pages/customer-support#chat" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                CHAT
              </Link>
              <Link 
                href="/account" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                CUENTA
              </Link>
              <Link 
                href="/pages/chapters" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                CAPÍTULOS
              </Link>
              <Link 
                href="/pages/shipping-returns" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                ENVÍOS Y DEVOLUCIONES
              </Link>
              <Link 
                href="/pages/size-guide" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                GUÍA DE TALLAS
              </Link>
              <Link 
                href="/pages/warranty" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                GARANTÍA
              </Link>
              <Link 
                href="/pages/legal" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                LEGAL
              </Link>
              <Link 
                href="/pages/accessibility" 
                className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  letterSpacing: '0.05em',
                  fontSize: '11px'
                }}
              >
                ACCESIBILIDAD
              </Link>
            </>
          )}
        </div>
      )}

      {/* Mobile Fullscreen Menu */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden"
          style={{ background: 'white' }}
        >
          <nav className="flex flex-col">
            <Link 
              href="/collections/new" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Nuevos Lanzamientos
            </Link>
            <Link 
              href="/collections/tees" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Camisetas
            </Link>
            <Link 
              href="/collections/sweats" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Sudaderas
            </Link>
            <Link 
              href="/collections/outerwear" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Abrigos
            </Link>
            <Link 
              href="/collections/shorts" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Shorts
            </Link>
            <Link 
              href="/collections/denim" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Denim
            </Link>
            <Link 
              href="/collections/accessories" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Accesorios
            </Link>
            <Link 
              href="/archive" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Archivo
            </Link>
            <Link 
              href="/pages/customer-support" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Atención al Cliente
            </Link>
            <Link 
              href="/pages/shipping-returns" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Envíos y Devoluciones
            </Link>
            <Link 
              href="/pages/size-guide" 
              className="px-4 py-4 text-xs font-medium uppercase border-b border-gray-200 hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Guía de Tallas
            </Link>
            <Link 
              href="/pages/warranty" 
              className="px-4 py-4 text-xs font-medium uppercase hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                letterSpacing: '0.05em',
                fontSize: '11px'
              }}
            >
              Garantía
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
