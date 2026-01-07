"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/store/cartStore";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="bg-white border-b border-[#E8E8E8]" style={{ fontFamily: 'Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Header Principal - 56px height */}
      <div className="px-4 md:px-8 py-3">
        <div className="flex items-center justify-between h-8">
          {/* Logo - Left */}
          <Link 
            href="/" 
            className="text-[18px] font-bold text-black hover:opacity-60 transition-opacity duration-200"
            style={{ letterSpacing: '-0.02em' }}
          >
            VIOGI
          </Link>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center gap-7">
            {/* SHOP Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <button 
                className="flex items-center gap-1 text-[11px] font-medium uppercase text-black hover:opacity-60 transition-opacity duration-200"
                style={{ letterSpacing: '0.08em' }}
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
              className="text-[11px] font-medium uppercase text-black hover:opacity-60 transition-opacity duration-200"
              style={{ letterSpacing: '0.08em' }}
            >
              ARCHIVO
            </Link>

            {/* SOPORTE Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setSupportOpen(true)}
              onMouseLeave={() => setSupportOpen(false)}
            >
              <button 
                className="flex items-center gap-1 text-[11px] font-medium uppercase text-black hover:opacity-60 transition-opacity duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                SOPORTE
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </nav>

          {/* Right side - Icons */}
          <div className="flex items-center gap-6">
            {/* SEARCH icon */}
            <button className="hover:opacity-60 transition-opacity duration-200" aria-label="Buscar">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* MXN - Desktop only */}
            <button 
              className="hidden md:block text-[11px] font-medium uppercase text-black hover:opacity-60 transition-opacity duration-200"
              style={{ letterSpacing: '0.08em' }}
            >
              MXN
            </button>

            {/* BAG icon */}
            <Link href="/cart" className="hover:opacity-60 transition-opacity duration-200" aria-label="Carrito">
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </Link>

            {/* MENU - Mobile only */}
            <button
              className="md:hidden text-[11px] font-medium uppercase hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              style={{ letterSpacing: '0.08em' }}
            >
              MENU
            </button>
          </div>
        </div>
      </div>

      {/* SHOP Dropdown - Expande el header hacia abajo */}
      {shopOpen && (
        <div 
          className="hidden md:block bg-white border-t border-[#E8E8E8]"
          onMouseEnter={() => setShopOpen(true)}
          onMouseLeave={() => setShopOpen(false)}
        >
          <div className="px-8 py-3">
            <nav className="flex items-center gap-6 overflow-x-auto">
              <Link 
                href="/collections/new" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                NUEVOS LANZAMIENTOS
              </Link>
              <Link 
                href="/collections/tees" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                CAMISETAS
              </Link>
              <Link 
                href="/collections/outerwear" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                ABRIGOS
              </Link>
              <Link 
                href="/collections/sweats" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                SUDADERAS
              </Link>
              <Link 
                href="/collections/shorts" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                SHORTS
              </Link>
              <Link 
                href="/collections/denim" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                DENIM
              </Link>
              <Link 
                href="/collections/accessories" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                ACCESORIOS
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* SOPORTE Dropdown - Expande el header hacia abajo */}
      {supportOpen && (
        <div 
          className="hidden md:block bg-white border-t border-[#E8E8E8]"
          onMouseEnter={() => setSupportOpen(true)}
          onMouseLeave={() => setSupportOpen(false)}
        >
          <div className="px-8 py-3">
            <nav className="flex items-center gap-6">
              <Link 
                href="/support/customer" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                ATENCIÓN AL CLIENTE
              </Link>
              <Link 
                href="/support/shipping" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                ENVÍOS Y DEVOLUCIONES
              </Link>
              <Link 
                href="/support/size-guide" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                GUÍA DE TALLAS
              </Link>
              <Link 
                href="/support/warranty" 
                className="text-[11px] font-medium uppercase whitespace-nowrap hover:bg-black hover:text-white px-3 py-2 transition-all duration-200"
                style={{ letterSpacing: '0.08em' }}
              >
                GARANTÍA
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Fullscreen Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white">
          <nav className="flex flex-col">
            <Link 
              href="/collections/new" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Nuevos Lanzamientos
            </Link>
            <Link 
              href="/collections/tees" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Camisetas
            </Link>
            <Link 
              href="/collections/sweats" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Sudaderas
            </Link>
            <Link 
              href="/collections/outerwear" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Abrigos
            </Link>
            <Link 
              href="/collections/shorts" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Shorts
            </Link>
            <Link 
              href="/collections/denim" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Denim
            </Link>
            <Link 
              href="/collections/accessories" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Accesorios
            </Link>
            <Link 
              href="/archive" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Archivo
            </Link>
            <Link 
              href="/support/customer" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Atención al Cliente
            </Link>
            <Link 
              href="/support/shipping" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Envíos y Devoluciones
            </Link>
            <Link 
              href="/support/size-guide" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Guía de Tallas
            </Link>
            <Link 
              href="/support/warranty" 
              className="px-4 py-4 text-[11px] font-medium uppercase border-b border-[#E8E8E8] hover:opacity-60 transition-opacity duration-200"
              onClick={() => setMobileMenuOpen(false)}
              style={{ letterSpacing: '0.08em' }}
            >
              Garantía
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
