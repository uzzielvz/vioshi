"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cartStore";

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [locale, setLocale] = useState<'es' | 'en'>('es'); // ES/MXN por defecto
  const { itemCount } = useCart();
  
  const currency = locale === 'es' ? 'MXN' : 'USD';
  const language = locale === 'es' ? 'ES' : 'EN';

  // Fijar submenú basado en la ruta actual
  useEffect(() => {
    if (pathname.startsWith('/collections') || pathname === '/collections/all') {
      setShopOpen(true);
      setSupportOpen(false);
    } else if (pathname.startsWith('/pages/customer-support') || pathname.startsWith('/support')) {
      setSupportOpen(true);
      setShopOpen(false);
    } else {
      // En otras páginas, cerrar ambos por defecto
      setShopOpen(false);
      setSupportOpen(false);
    }
  }, [pathname]);

  // Verificar si estamos en una página donde el menú debe estar fijo
  const isShopPage = pathname.startsWith('/collections') || pathname === '/collections/all';
  const isSupportPage = pathname.startsWith('/pages/customer-support') || pathname.startsWith('/support');

  // Manejar click en SHOP
  const handleShopClick = (e: React.MouseEvent) => {
    if (!isShopPage) {
      // Si NO estamos en la página de SHOP, toggle el menú
      e.preventDefault(); // Prevenir navegación
      setShopOpen(!shopOpen);
      setSupportOpen(false);
    }
    // Si estamos en la página de SHOP, dejar que navegue
  };

  // Manejar click en SOPORTE
  const handleSupportClick = (e: React.MouseEvent) => {
    if (!isSupportPage) {
      // Si NO estamos en la página de SOPORTE, toggle el menú
      e.preventDefault(); // Prevenir navegación
      setSupportOpen(!supportOpen);
      setShopOpen(false);
    }
    // Si estamos en la página de SOPORTE, dejar que navegue
  };

  // Cerrar menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-nav-menu="true"]') && !isShopPage && !isSupportPage) {
        setShopOpen(false);
        setSupportOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isShopPage, isSupportPage]);

  // Cerrar búsqueda con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery("");
      }
      if (e.key === 'Escape' && currencyOpen) {
        setCurrencyOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [searchOpen, currencyOpen]);

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
        <nav className="hidden md:flex items-center gap-8 absolute left-32" data-nav-menu="true">
          
          {/* SHOP */}
          <div>
            <Link
              href="/collections/all"
              onClick={handleShopClick}
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
            </Link>
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
          <div>
            <Link
              href="/pages/customer-support"
              onClick={handleSupportClick}
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
            </Link>
          </div>
        </nav>

        {/* RIGHT SIDE - TEXT */}
        <div className="flex items-center gap-6">
          {/* BUSCAR / CERRAR */}
          <button 
            onClick={() => {
              if (searchOpen) {
                setSearchOpen(false);
                setSearchQuery("");
              } else {
                setSearchOpen(true);
              }
            }}
            className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
              letterSpacing: '0.05em',
              fontSize: '11px'
            }}
          >
            {searchOpen ? 'CERRAR' : 'BUSCAR'}
          </button>

          {/* IDIOMA / MONEDA */}
          <button 
            onClick={() => setCurrencyOpen(!currencyOpen)}
            className="hidden md:flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{ 
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
              letterSpacing: '0.05em',
              fontSize: '11px'
            }}
          >
            {/* BANDERA SVG */}
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-13l9-4 9 4v13M3 8l9-4 9 4" />
            </svg>
            {language} / {currency}
          </button>

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
          data-nav-menu="true"
          className="hidden md:flex items-center gap-4 py-3"
          style={{
            background: 'transparent',
            paddingLeft: '128px'
          }}
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

      {/* CURRENCY/LANGUAGE SELECTOR */}
      {currencyOpen && (
        <>
          {/* DROPDOWN */}
          <div 
            className="fixed left-0 right-0 bg-white"
            style={{
              top: '56px',
              borderBottom: '1px solid #E8E8E8',
              zIndex: 39
            }}
          >
            <div className="flex items-center gap-6 py-4 px-8">
              {/* ESPAÑOL / MXN */}
              <button
                onClick={() => {
                  setLocale('es');
                  setCurrencyOpen(false);
                }}
                className="flex items-center gap-2 hover:opacity-60 transition-opacity duration-200"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  opacity: locale === 'es' ? 1 : 0.5
                }}
              >
                {/* BANDERA MX */}
                <svg className="w-4 h-3" viewBox="0 0 24 18" fill="none">
                  <rect width="8" height="18" fill="#006847" />
                  <rect x="8" width="8" height="18" fill="#FFFFFF" />
                  <rect x="16" width="8" height="18" fill="#CE1126" />
                </svg>
                ES / MXN
              </button>

              {/* ENGLISH / USD */}
              <button
                onClick={() => {
                  setLocale('en');
                  setCurrencyOpen(false);
                }}
                className="flex items-center gap-2 hover:opacity-60 transition-opacity duration-200"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  opacity: locale === 'en' ? 1 : 0.5
                }}
              >
                {/* BANDERA US */}
                <svg className="w-4 h-3" viewBox="0 0 24 18" fill="none">
                  <rect width="24" height="18" fill="#B22234" />
                  <rect width="24" height="2" y="2" fill="#FFFFFF" />
                  <rect width="24" height="2" y="6" fill="#FFFFFF" />
                  <rect width="24" height="2" y="10" fill="#FFFFFF" />
                  <rect width="24" height="2" y="14" fill="#FFFFFF" />
                  <rect width="10" height="10" fill="#3C3B6E" />
                </svg>
                EN / USD
              </button>
            </div>
          </div>

          {/* OVERLAY */}
          <div
            onClick={() => setCurrencyOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-30"
            style={{
              top: '56px',
              zIndex: 38
            }}
          />
        </>
      )}

      {/* SEARCH MODAL - Debajo del header */}
      {searchOpen && (
        <>
          {/* SEARCH BAR */}
          <div 
            className="fixed left-0 right-0 bg-white"
            style={{
              top: '56px', // Altura del header
              borderBottom: '1px solid #E8E8E8',
              zIndex: 39
            }}
          >
            <div className="flex items-center gap-4 py-4 px-8 md:px-0" style={{ paddingLeft: '32px' }}>
              {/* LUPA - Mobile: alineada al borde, Desktop: alineada con SHOP */}
              <svg 
                className="w-5 h-5 text-black flex-shrink-0 md:ml-24" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>

              {/* INPUT */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="BUSCAR AQUÍ"
                className="flex-1 bg-transparent text-black placeholder-gray-400 outline-none"
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
                  fontSize: '11px',
                  fontWeight: 500,
                  letterSpacing: '0.05em'
                }}
                autoFocus
              />

              {/* X CERRAR */}
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-black hover:opacity-60 transition-opacity duration-200 flex-shrink-0"
                style={{
                  fontSize: '20px',
                  lineHeight: '1'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* OVERLAY - Sombreado del contenido */}
          <div
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className="fixed inset-0 bg-black bg-opacity-30"
            style={{
              top: '56px', // Comienza debajo del header
              zIndex: 38
            }}
          />
        </>
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
