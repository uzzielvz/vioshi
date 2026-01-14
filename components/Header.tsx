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
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileSupportOpen, setMobileSupportOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  
  const currency = locale === 'es' ? 'MXN' : 'USD';
  const language = locale === 'es' ? 'ES' : 'EN';
  const country = locale === 'es' ? 'MÉXICO' : 'UNITED STATES';

  // Fijar submenú basado en la ruta actual
  useEffect(() => {
    if (pathname.startsWith('/collections') || pathname === '/collections/all') {
      setShopOpen(true);
      setSupportOpen(false);
    } else if ((pathname.startsWith('/pages/') && pathname !== '/pages/chapters') || pathname.startsWith('/support')) {
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
  const isSupportPage = (pathname.startsWith('/pages/') && pathname !== '/pages/chapters') || pathname.startsWith('/support');

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
        background: (searchOpen || mobileMenuOpen) ? 'white' : 'transparent',
        borderBottom: 'none'
      }}
    >
      {/* ROW 1 - HEADER PRINCIPAL */}
      <div className="flex items-center justify-between px-8 h-14" style={{ background: (searchOpen || mobileMenuOpen) ? 'white' : 'transparent' }}>
        
        {/* LEFT - LOGO SOLAMENTE */}
        <Link 
          href="/" 
          className="text-lg font-bold text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap"
          style={{ 
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
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
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                letterSpacing: '0.02em',
                fontSize: '11px',
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              SHOP
              {/* CHEVRON que rota */}
              <svg 
                className="w-3 h-3 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth={2.5}
                style={{
                  transform: shopOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* ARCHIVO */}
          <Link 
            href="/archive" 
            className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{ 
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              letterSpacing: '0.02em',
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
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                letterSpacing: '0.02em',
                fontSize: '11px',
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              SOPORTE
              {/* CHEVRON que rota */}
              <svg 
                className="w-3 h-3 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth={2.5}
                style={{
                  transform: supportOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                }}
              >
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
                setMobileMenuOpen(false); // Cerrar menú móvil al abrir búsqueda
              }
            }}
            className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{ 
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              letterSpacing: '0.02em',
              fontSize: '11px',
              textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
            }}
          >
            {searchOpen ? 'CERRAR' : 'BUSCAR'}
          </button>

          {/* IDIOMA / MONEDA */}
          <button 
            onClick={() => setCurrencyOpen(!currencyOpen)}
            className="hidden md:flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 relative"
            style={{ 
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              letterSpacing: '0.02em',
              fontSize: '11px'
            }}
          >
            {language} / {currency}
            {/* CHEVRON que rota */}
            <svg 
              className="w-3 h-3 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              strokeWidth={2.5}
              style={{
                transform: currencyOpen ? 'rotate(90deg)' : 'rotate(0deg)'
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* DROPDOWN COMPACTO */}
          {currencyOpen && (
            <div 
              className="hidden md:block absolute border"
              style={{
                top: '100%',
                right: 0,
                marginTop: '4px',
                minWidth: '120px',
                zIndex: 50,
                background: 'rgba(255, 255, 255, 0.98)',
                borderColor: 'rgba(232, 232, 232, 0.3)'
              }}
            >
              <button
                onClick={() => {
                  setLocale('es');
                  setCurrencyOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:opacity-60 transition-opacity duration-200"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  opacity: locale === 'es' ? 1 : 0.6,
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                ES / MXN
              </button>
              <button
                onClick={() => {
                  setLocale('en');
                  setCurrencyOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:opacity-60 transition-opacity duration-200"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  opacity: locale === 'en' ? 1 : 0.6,
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                EN / USD
              </button>
            </div>
          )}

          {/* BAG */}
          <button
            onClick={openCart}
            className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              letterSpacing: '0.02em',
              fontSize: '11px',
              textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
            }}
          >
            {/* Desktop: BAG (1), Mobile: BAG 1 */}
            <span className="hidden md:inline">BAG {itemCount > 0 && `(${itemCount})`}</span>
            <span className="inline md:hidden">BAG {itemCount > 0 && itemCount}</span>
          </button>

          {/* MENU - Mobile only */}
          <button
            className="md:hidden text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setSearchOpen(false); // Cerrar búsqueda al abrir menú móvil
              setSearchQuery("");
            }}
            aria-label="Menu"
            style={{ 
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              letterSpacing: '0.02em',
              fontSize: '11px',
              textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
            }}
          >
            {mobileMenuOpen ? 'CERRAR' : 'MENÚ'}
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
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  padding: '0',
                  margin: '0',
                  lineHeight: '1',
                  color: pathname === '/collections/new' ? '#000' : '#666',
                  borderBottom: pathname === '/collections/new' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/collections/new' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                NUEVO DROP
              </Link>
              <Link
                href="/collections/hoodie"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  padding: '0',
                  margin: '0',
                  lineHeight: '1',
                  color: pathname === '/collections/hoodie' ? '#000' : '#666',
                  borderBottom: pathname === '/collections/hoodie' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/collections/hoodie' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                HOODIE
              </Link>
              <Link
                href="/collections/chamarra"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/collections/chamarra' ? '#000' : '#666',
                  borderBottom: pathname === '/collections/chamarra' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/collections/chamarra' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                CHAMARRA
              </Link>
              <Link
                href="/collections/pants"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/collections/pants' ? '#000' : '#666',
                  borderBottom: pathname === '/collections/pants' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/collections/pants' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                PANTS
              </Link>
              <Link
                href="/collections/jeans"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/collections/jeans' ? '#000' : '#666',
                  borderBottom: pathname === '/collections/jeans' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/collections/jeans' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                JEANS
              </Link>
              <Link
                href="/collections/camisas"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/collections/camisas' ? '#000' : '#666',
                  borderBottom: pathname === '/collections/camisas' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/collections/camisas' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                CAMISAS
              </Link>
              <Link
                href="/collections/playeras"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/collections/playeras' ? '#000' : '#666',
                  borderBottom: pathname === '/collections/playeras' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/collections/playeras' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                PLAYERAS
              </Link>
              <Link
                href="/collections/accesorios"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/collections/accesorios' ? '#000' : '#666',
                  borderBottom: pathname === '/collections/accesorios' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/collections/accesorios' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                ACCESORIOS
              </Link>
              <Link
                href="/collections/bolsos"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/collections/bolsos' ? '#000' : '#666',
                  borderBottom: pathname === '/collections/bolsos' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/collections/bolsos' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                BOLSOS
              </Link>
            </>
          )}

          {supportOpen && (
            <>
              <Link
                href="/pages/customer-support"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/pages/customer-support' ? '#000' : '#666',
                  borderBottom: pathname === '/pages/customer-support' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/pages/customer-support' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                CUSTOMER SUPPORT
              </Link>
              <Link
                href="/pages/customer-support#chat"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: '#666',
                  borderBottom: '1px solid transparent',
                  textShadow: 'none'
                }}
              >
                CHAT
              </Link>
              <Link
                href="/pages/locaciones"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/pages/locaciones' ? '#000' : '#666',
                  borderBottom: pathname === '/pages/locaciones' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/pages/locaciones' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                LOCACIONES
              </Link>
              <Link
                href="/pages/shipping-payments-returns"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/pages/shipping-payments-returns' ? '#000' : '#666',
                  borderBottom: pathname === '/pages/shipping-payments-returns' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/pages/shipping-payments-returns' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                ENVÍOS, PAGOS Y DEVOLUCIONES
              </Link>
              <Link
                href="/pages/size-guide"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/pages/size-guide' ? '#000' : '#666',
                  borderBottom: pathname === '/pages/size-guide' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/pages/size-guide' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                GUÍA DE TALLAS
              </Link>
              <Link
                href="/pages/legal"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/pages/legal' ? '#000' : '#666',
                  borderBottom: pathname === '/pages/legal' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/pages/legal' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                LEGAL
              </Link>
              <Link
                href="/pages/accessibility"
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: pathname === '/pages/accessibility' ? '#000' : '#666',
                  borderBottom: pathname === '/pages/accessibility' ? '1px solid #000' : '1px solid transparent',
                  textShadow: pathname === '/pages/accessibility' ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                ACCESIBILIDAD
              </Link>
            </>
          )}
        </div>
      )}


      {/* SEARCH MODAL - Estilo Stüssy */}
      {searchOpen && (
        <>
          {/* SEARCH BAR */}
          <div
            className="fixed left-0 right-0"
            style={{
              top: '56px',
              background: 'white',
              zIndex: 39,
              borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center gap-4 py-4 px-8 md:px-0" style={{ paddingLeft: '32px', background: 'white' }}>
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
                placeholder="SEARCH HERE"
                className="flex-1 text-black outline-none search-input-placeholder text-[10px] md:text-[11px]"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontWeight: 400,
                  letterSpacing: '0.02em',
                  background: 'white',
                  color: '#000'
                }}
                autoFocus
              />

              {/* X CERRAR - Grande (oculta en móvil) */}
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="hidden md:block text-black hover:opacity-60 transition-opacity duration-200 flex-shrink-0 mr-6"
                style={{
                  fontSize: '28px',
                  lineHeight: '1',
                  fontWeight: '300'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* OVERLAY GRIS - Click para cerrar con cursor X */}
          <div
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className="fixed inset-0 search-overlay-cursor"
            style={{
              top: '112px',
              zIndex: 37,
              background: 'rgba(0, 0, 0, 0.4)'
            }}
          />
        </>
      )}

      {/* Mobile Fullscreen Menu - Estilo Stüssy */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 overflow-y-auto"
          style={{ 
            top: '56px',
            background: 'white'
          }}
        >
          <nav className="flex flex-col">
            {/* SHOP - Acordeón */}
            <div className="border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
              <button
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
                className="w-full flex items-center justify-between px-6 py-5 text-black hover:opacity-60 transition-opacity duration-200 mobile-menu-button"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  WebkitTapHighlightColor: 'transparent',
                  backgroundColor: 'white'
                }}
              >
                SHOP
                <svg 
                  className="w-3 h-3 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2.5}
                  style={{
                    transform: mobileShopOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileShopOpen && (
                <div className="pb-3">
                  <Link
                    href="/collections/all"
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    TODO
                  </Link>
                  <Link
                    href="/collections/new"
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    NUEVO DROP
                  </Link>
                  <Link 
                    href="/collections/hoodie" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    HOODIE
                  </Link>
                  <Link 
                    href="/collections/chamarra" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    CHAMARRA
                  </Link>
                  <Link 
                    href="/collections/pants" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    PANTS
                  </Link>
                  <Link 
                    href="/collections/jeans" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    JEANS
                  </Link>
                  <Link 
                    href="/collections/camisas" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    CAMISAS
                  </Link>
                  <Link 
                    href="/collections/playeras" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    PLAYERAS
                  </Link>
                  <Link 
                    href="/collections/accesorios" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    ACCESORIOS
                  </Link>
                  <Link 
                    href="/collections/bolsos" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    BOLSOS
                  </Link>
                </div>
              )}
            </div>

            {/* SUPPORT - Acordeón */}
            <div className="border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
              <button
                onClick={() => setMobileSupportOpen(!mobileSupportOpen)}
                className="w-full flex items-center justify-between px-6 py-5 text-black hover:opacity-60 transition-opacity duration-200 mobile-menu-button"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  WebkitTapHighlightColor: 'transparent',
                  backgroundColor: 'white'
                }}
              >
                SOPORTE
                <svg 
                  className="w-3 h-3 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2.5}
                  style={{
                    transform: mobileSupportOpen ? 'rotate(90deg)' : 'rotate(0deg)'
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileSupportOpen && (
                <div className="pb-3">
                  <Link 
                    href="/pages/customer-support" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    CUSTOMER SUPPORT
                  </Link>
                  <Link 
                    href="/pages/customer-support#chat" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    CHAT
                  </Link>
                  <Link 
                    href="/pages/locaciones" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    LOCACIONES
                  </Link>
                  <Link 
                    href="/pages/shipping-payments-returns" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    ENVÍOS, PAGOS Y DEVOLUCIONES
                  </Link>
                  <Link 
                    href="/pages/size-guide" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    GUÍA DE TALLAS
                  </Link>
                  <Link 
                    href="/pages/legal" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    LEGAL
                  </Link>
                  <Link 
                    href="/pages/accessibility" 
                    className="block px-6 py-3 text-black hover:opacity-60 transition-opacity duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      letterSpacing: '0.02em',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                    }}
                  >
                    ACCESIBILIDAD
                  </Link>
                </div>
              )}
            </div>

            {/* CUENTA */}
            <Link
              href="/account"
              className="px-6 py-5 text-black hover:opacity-60 transition-opacity duration-200 border-b"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                letterSpacing: '0.02em',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                borderColor: 'rgba(0, 0, 0, 0.08)',
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >

              CUENTA
            </Link>

            {/* CAPÍTULOS */}
            <Link 
              href="/pages/chapters" 
              className="px-6 py-5 text-black hover:opacity-60 transition-opacity duration-200 border-b"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                letterSpacing: '0.02em',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                borderColor: 'rgba(0, 0, 0, 0.08)',
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              CAPÍTULOS
            </Link>
            {/* ARCHIVO */}
            <Link 
              href="/archive" 
              className="px-6 py-5 text-black hover:opacity-60 transition-opacity duration-200 border-b"
              onClick={() => setMobileMenuOpen(false)}
              style={{ 
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                letterSpacing: '0.02em',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                borderColor: 'rgba(0, 0, 0, 0.08)',
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              ARCHIVO
            </Link>

            {/* SHIPPING TO - Selector de País/Moneda */}
            <div className="px-6 py-5 flex items-center justify-between border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
              <p 
                style={{ 
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                ENVÍO A: {country} / {currency}
              </p>
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="text-black hover:opacity-60 transition-opacity duration-200"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
                }}
              >
                CAMBIAR
              </button>
            </div>
          </nav>

          {/* MODAL DE IDIOMA/MONEDA EN MOBILE */}
          {currencyOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
              <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
                <h3 
                  className="mb-6"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase'
                  }}
                >
                  SELECCIONAR IDIOMA / MONEDA
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setLocale('es');
                      setCurrencyOpen(false);
                    }}
                    className="w-full text-left p-4 border border-gray-200 rounded hover:opacity-60 transition-opacity duration-200"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      opacity: locale === 'es' ? 1 : 0.6
                    }}
                  >
                    ES / MXN
                  </button>
                  <button
                    onClick={() => {
                      setLocale('en');
                      setCurrencyOpen(false);
                    }}
                    className="w-full text-left p-4 border border-gray-200 rounded hover:opacity-60 transition-opacity duration-200"
                    style={{
                      fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      opacity: locale === 'en' ? 1 : 0.6
                    }}
                  >
                    EN / USD
                  </button>
                </div>
                <button
                  onClick={() => setCurrencyOpen(false)}
                  className="mt-6 w-full p-3 bg-black text-white hover:opacity-80 transition-opacity duration-200"
                  style={{
                    fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase'
                  }}
                >
                  CERRAR
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
