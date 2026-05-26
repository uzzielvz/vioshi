"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';
import { useCart } from "@/store/cartStore";
import VisualSearchPanel from "@/components/VisualSearchPanel";
import SearchPanel from "@/components/SearchPanel";

// Pathname sin prefijo de locale para comparaciones (evita hydration mismatch server vs client)
function getPathnameWithoutLocale(pathname: string): string {
  return pathname.replace(/^\/[a-z]{2}/, '') || '/';
}

interface HeaderProps {
  userEmail?: string | null;
}

export default function Header({ userEmail = null }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  const tHeader = useTranslations('header');
  const tCommon = useTranslations('common');
  const { locale, currency } = useLocaleContext();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileSupportOpen, setMobileSupportOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [vsFile, setVsFile] = useState<File | null>(null);
  const vsInputRef = useRef<HTMLInputElement>(null);
  const { itemCount, openCart } = useCart();

  // Evitar hydration mismatch: pathname/locale pueden diferir server vs client al cambiar idioma
  useEffect(() => {
    setMounted(true);
  }, []);

  const language = locale.toUpperCase();
  const country = tCommon('country');

  const switchLocale = (newLocale: 'es' | 'en') => {
    if (newLocale === locale) return;
    const newPath = `/${newLocale}${pathnameWithoutLocale === '/' ? '' : pathnameWithoutLocale}`;
    // Full page navigation evita el error removeChild de React al cambiar locale (next-intl + App Router)
    window.location.href = newPath;
  };

  // Fijar submenú basado en la ruta actual (solo después de montar para evitar hydration mismatch)
  useEffect(() => {
    if (!mounted) return;
    const isShopRoute = pathnameWithoutLocale.includes('/collections') || pathnameWithoutLocale.endsWith('/collections/all');
    const isSupportRoute = (pathnameWithoutLocale.includes('/pages/') && !pathnameWithoutLocale.endsWith('/pages/chapters')) || pathnameWithoutLocale.includes('/support');
    
    if (isShopRoute) {
      setShopOpen(true);
      setSupportOpen(false);
    } else if (isSupportRoute) {
      setSupportOpen(true);
      setShopOpen(false);
    } else {
      setShopOpen(false);
      setSupportOpen(false);
    }
  }, [pathnameWithoutLocale, mounted]);

  // Solo usar pathname para estilos/activo después de montar (evita hydration al cambiar idioma)
  const isShopPage = mounted && (pathnameWithoutLocale.includes('/collections') || pathnameWithoutLocale.endsWith('/collections/all'));
  const isSupportPage = mounted && ((pathnameWithoutLocale.includes('/pages/') && !pathnameWithoutLocale.endsWith('/pages/chapters')) || pathnameWithoutLocale.includes('/support'));

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
        borderBottom: 'none',
        transition: 'background-color 0.2s ease-in-out'
      }}
    >
      {/* ROW 1 - HEADER PRINCIPAL */}
      <div 
        className="flex items-center justify-between px-8 h-14" 
        style={{ 
          background: (searchOpen || mobileMenuOpen) ? 'white' : 'transparent',
          transition: 'background-color 0.2s ease-in-out'
        }}
      >
        
        {/* LEFT - LOGO + ESPACIO MÍNIMO + NAV */}
        <div className="flex items-center min-w-0">
          <Link
            href={`/${locale}`}
            className="text-lg font-bold text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap shrink-0"
            style={{ 
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
            }}
          >
            VIOGI
          </Link>
          {/* Espacio fijo mínimo entre logo y enlaces */}
          <span className="hidden md:inline-block shrink-0 min-w-[4rem]" aria-hidden />
          {/* CENTER - NAVEGACIÓN */}
          <nav className="hidden md:flex items-center gap-8 ml-0" data-nav-menu="true">
          
          {/* SHOP */}
          <div>
            <Link
              href={`/${locale}/collections/all`}
              onClick={handleShopClick}
              className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 flex items-center gap-1"
              style={{ 
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                letterSpacing: '0.02em',
                fontSize: '11px',
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              {tHeader('shop')}
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
            href={`/${locale}/archive`}
            className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{ 
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              letterSpacing: '0.02em',
              fontSize: '11px',
              padding: '0',
              margin: '0'
            }}
          >
            {tHeader('archive')}
          </Link>

          {/* SOPORTE */}
          <div>
            <Link
              href={`/${locale}/pages/customer-support`}
              onClick={handleSupportClick}
              className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200 flex items-center gap-1"
              style={{ 
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                letterSpacing: '0.02em',
                fontSize: '11px',
                textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
              }}
            >
              {tHeader('support')}
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
        </div>

        {/* RIGHT SIDE - TEXT */}
        <div className="flex items-center gap-6">
          {/* VISUAL SEARCH - Desktop only */}
          <Link
            href="/visual-search"
            className="hidden md:inline text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              letterSpacing: '0.02em',
              fontSize: '11px',
              textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
            }}
          >
            {tCommon('visual_search')}
          </Link>

          {/* BUSCAR / CERRAR */}
          <button
            onClick={() => {
              if (searchOpen) {
                setSearchOpen(false);
                setSearchQuery("");
                setVsFile(null);
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
            {searchOpen ? tCommon('close') : tCommon('search')}
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
                  switchLocale('es');
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
                  switchLocale('en');
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

          {/* LOG IN / MI CUENTA */}
          <Link
            href={`/${locale}/account`}
            title={userEmail ?? undefined}
            className="text-xs font-medium uppercase tracking-wide text-black hover:opacity-60 transition-opacity duration-200"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              letterSpacing: '0.02em',
              fontSize: '11px',
              textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'
            }}
          >
            {userEmail ? tCommon('myAccount') : tCommon('logIn')}
          </Link>

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
            {/* Desktop: BAG (1), Mobile: BAG 1 - Solo mostrar contador después de montar para evitar hydration mismatch */}
            <span className="hidden md:inline">{tCommon('bag')} {mounted && itemCount > 0 && `(${itemCount})`}</span>
            <span className="inline md:hidden">{tCommon('bag')} {mounted && itemCount > 0 && itemCount}</span>
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
            {mobileMenuOpen ? tCommon('close') : tCommon('menu')}
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
            paddingLeft: '128px',
            transition: 'opacity 0.2s ease-in-out'
          }}
        >
          {shopOpen && (
            <>
              <Link
                href={`/${locale}/collections/hoodie`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  padding: '0',
                  margin: '0',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/collections/hoodie') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/collections/hoodie') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/collections/hoodie') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('hoodie')}
              </Link>
              <Link
                href={`/${locale}/collections/chamarra`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/collections/chamarra') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/collections/chamarra') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/collections/chamarra') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('jacket')}
              </Link>
              <Link
                href={`/${locale}/collections/pants`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/collections/pants') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/collections/pants') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/collections/pants') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('pants')}
              </Link>
              <Link
                href={`/${locale}/collections/jeans`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/collections/jeans') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/collections/jeans') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/collections/jeans') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('jeans')}
              </Link>
              <Link
                href={`/${locale}/collections/camisas`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/collections/camisas') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/collections/camisas') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/collections/camisas') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('shirts')}
              </Link>
              <Link
                href={`/${locale}/collections/playeras`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/collections/playeras') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/collections/playeras') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/collections/playeras') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('tees')}
              </Link>
              <Link
                href={`/${locale}/collections/accesorios`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/collections/accesorios') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/collections/accesorios') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/collections/accesorios') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('accessories')}
              </Link>
              <Link
                href={`/${locale}/collections/bolsos`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/collections/bolsos') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/collections/bolsos') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/collections/bolsos') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('bags')}
              </Link>
            </>
          )}

          {supportOpen && (
            <>
              <Link
                href={`/${locale}/pages/customer-support`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/pages/customer-support') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/pages/customer-support') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/pages/customer-support') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('customer_support')}
              </Link>
              <Link
                href={`/${locale}/pages/locaciones`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/pages/locaciones') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/pages/locaciones') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/pages/locaciones') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('locations')}
              </Link>
              <Link
                href={`/${locale}/pages/shipping-payments-returns`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/pages/shipping-payments-returns') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/pages/shipping-payments-returns') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/pages/shipping-payments-returns') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('shipping_payments_returns')}
              </Link>
              <Link
                href={`/${locale}/pages/accessibility`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/pages/accessibility') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/pages/accessibility') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/pages/accessibility') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('accessibility')}
              </Link>
              <Link
                href={`/${locale}/pages/legal`}
                className="text-xs font-medium uppercase tracking-wide transition-all duration-200 whitespace-nowrap hover:text-black hover:border-b hover:border-black submenu-link"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  letterSpacing: '0.02em',
                  fontSize: '11px',
                  lineHeight: '1',
                  color: (mounted && pathnameWithoutLocale === '/pages/legal') ? '#000' : '#666',
                  borderBottom: (mounted && pathnameWithoutLocale === '/pages/legal') ? '1px solid #000' : '1px solid transparent',
                  textShadow: (mounted && pathnameWithoutLocale === '/pages/legal') ? '0 0 0.5px rgba(0, 0, 0, 0.8)' : 'none'
                }}
              >
                {tHeader('legal')}
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
            <form
              className="flex items-center gap-4 py-4 px-8 md:px-0"
              style={{ paddingLeft: '32px', background: 'white' }}
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchQuery.trim();
                if (!q) return;
                setSearchOpen(false);
                setSearchQuery('');
                router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
              }}
            >
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
                placeholder={tHeader('search_placeholder')}
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

              {/* ÍCONO CÁMARA - Búsqueda visual */}
              <button
                type="button"
                onClick={() => vsInputRef.current?.click()}
                className="flex-shrink-0 text-black hover:opacity-60 transition-opacity duration-200"
                title="Buscar por imagen"
                aria-label="Búsqueda visual"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>

              {/* Input de imagen oculto */}
              <input
                ref={vsInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setVsFile(f);
                  // Reset input so same file can be re-selected
                  e.target.value = '';
                }}
              />

              {/* X CERRAR - Grande (oculta en móvil) */}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  setVsFile(null);
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
            </form>

            {/* Panel de búsqueda visual */}
            {vsFile && (
              <VisualSearchPanel
                locale={locale}
                file={vsFile}
                onClose={() => setVsFile(null)}
              />
            )}

            {/* Panel de búsqueda de texto (solo cuando no hay visual search activa) */}
            {!vsFile && (
              <SearchPanel
                locale={locale}
                query={searchQuery}
                onSelect={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
              />
            )}
          </div>

          {/* OVERLAY GRIS - Click para cerrar con cursor X */}
          <div
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
              setVsFile(null);
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
                {tHeader('shop')}
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
                    href={`/${locale}/collections/all`}
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
                    {tHeader('all')}
                  </Link>
                  <Link
                    href={`/${locale}/collections/hoodie`}
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
                    {tHeader('hoodie')}
                  </Link>
                  <Link
                    href={`/${locale}/collections/chamarra`}
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
                    {tHeader('jacket')}
                  </Link>
                  <Link
                    href={`/${locale}/collections/pants`}
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
                    {tHeader('pants')}
                  </Link>
                  <Link
                    href={`/${locale}/collections/jeans`}
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
                    {tHeader('jeans')}
                  </Link>
                  <Link
                    href={`/${locale}/collections/camisas`}
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
                    {tHeader('shirts')}
                  </Link>
                  <Link
                    href={`/${locale}/collections/playeras`}
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
                    {tHeader('tees')}
                  </Link>
                  <Link
                    href={`/${locale}/collections/accesorios`}
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
                    {tHeader('accessories')}
                  </Link>
                  <Link
                    href={`/${locale}/collections/bolsos`}
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
                    {tHeader('bags')}
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
                {tHeader('support')}
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
                    href={`/${locale}/pages/customer-support`}
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
                    {tHeader('customer_support')}
                  </Link>
                  <Link
                    href={`/${locale}/pages/locaciones`}
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
                    {tHeader('locations')}
                  </Link>
                  <Link
                    href={`/${locale}/pages/shipping-payments-returns`}
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
                    {tHeader('shipping_payments_returns')}
                  </Link>
                  <Link
                    href={`/${locale}/pages/size-guide`}
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
                    {tHeader('size_guide')}
                  </Link>
                  <Link
                    href={`/${locale}/pages/legal`}
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
                    {tHeader('legal')}
                  </Link>
                  <Link
                    href={`/${locale}/pages/accessibility`}
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
                    {tHeader('accessibility')}
                  </Link>
                </div>
              )}
            </div>

            {/* LOG IN / MI CUENTA */}
            <Link
              href={`/${locale}/account`}
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
              {userEmail ? tCommon('myAccount') : tCommon('logIn')}
            </Link>

            {/* CAPÍTULOS */}
            <Link
              href={`/${locale}/pages/chapters`}
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
              {tHeader('chapters')}
            </Link>
            {/* ARCHIVO */}
            <Link
              href={`/${locale}/archive`}
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
              {tHeader('archive')}
            </Link>

            {/* VISUAL SEARCH */}
            <Link
              href="/visual-search"
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
              {tCommon('visual_search')}
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
                {tHeader('language')} {country} / {currency}
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
                {tHeader('change')}
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
                  {tHeader('select_language_currency')}
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      switchLocale('es');
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
                      switchLocale('en');
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
                  {tCommon('close')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

