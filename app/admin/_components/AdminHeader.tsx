'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import LogoutButton from './LogoutButton'
import { brand } from '@/lib/brand'
import type { AdminActor } from '@/lib/admin/session'

/**
 * Panel navigation, styled as a copy of the storefront header
 * (components/Header.tsx): white bar, h-14, Helvetica 11px uppercase links,
 * hover:opacity-60. The panel should read as one more section of the store,
 * not as a separate app.
 *
 * Uzziel sees 8 entries, which don't fit in one row below `lg`, so the inline
 * nav starts there; below it the same full-screen menu as the store is used.
 */

const navFont = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
  fontSize: '11px',
  letterSpacing: '0.02em',
  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)',
}

type Entry = { href: string; label: string; active: boolean }

function useEntries(actor: AdminActor): Entry[] {
  const pathname = usePathname()

  const base: Entry[] = [
    { href: '/admin', label: 'Tablero', active: pathname === '/admin' },
    { href: '/admin/products', label: 'Inventario', active: pathname.startsWith('/admin/products') },
  ]

  if (actor !== 'uzziel') return base

  return [
    ...base,
    { href: '/admin/reservas', label: 'Pedidos', active: pathname.startsWith('/admin/reservas') },
    { href: '/admin/studio', label: 'Studio', active: pathname.startsWith('/admin/studio') },
    {
      href: '/admin/pickup-points',
      label: 'Puntos de entrega',
      active: pathname.startsWith('/admin/pickup-points'),
    },
    { href: '/admin/brands', label: 'Marcas', active: pathname.startsWith('/admin/brands') },
    { href: '/admin/fondos', label: 'Fondos', active: pathname.startsWith('/admin/fondos') },
    { href: '/admin/settings', label: 'Parámetros', active: pathname.startsWith('/admin/settings') },
  ]
}

export default function AdminHeader({ actor }: { actor: AdminActor }) {
  const entries = useEntries(actor)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close on navigation, otherwise the menu covers the page you just opened.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const actorLabel = actor === 'mario' ? 'Mario' : 'Uzziel'

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="flex items-center justify-between px-4 md:px-8 h-14">
        <div className="flex items-center min-w-0">
          <Link
            href="/admin"
            className="text-lg font-bold text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap shrink-0"
            style={{ fontFamily: navFont.fontFamily }}
          >
            {brand.name}
          </Link>
          <span className="shrink-0 min-w-[4rem] hidden lg:inline-block" aria-hidden />

          <nav className="hidden lg:flex items-center gap-8">
            {entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                aria-current={entry.active ? 'page' : undefined}
                className={`uppercase font-medium text-black whitespace-nowrap hover:opacity-60 transition-opacity duration-200 ${
                  entry.active ? 'border-b border-black' : ''
                }`}
                style={navFont}
              >
                {entry.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <span className="hidden sm:inline uppercase font-medium text-[#666]" style={navFont}>
            {actorLabel}
          </span>
          <span className="hidden lg:flex">
            <LogoutButton />
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="lg:hidden uppercase font-medium text-black hover:opacity-60 transition-opacity duration-200 min-h-[44px]"
            style={navFont}
          >
            {open ? 'Cerrar' : 'Menú'}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto bg-white" style={{ top: '56px' }}>
          <nav className="flex flex-col">
            {entries.map((entry) => (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => setOpen(false)}
                aria-current={entry.active ? 'page' : undefined}
                className={`flex items-center px-6 py-5 border-b uppercase hover:opacity-60 transition-opacity duration-200 ${
                  entry.active ? 'text-black' : 'text-black/50'
                }`}
                style={{ ...navFont, fontWeight: 800, borderColor: 'rgba(0, 0, 0, 0.08)' }}
              >
                {entry.label}
              </Link>
            ))}
            <div className="px-6 py-5">
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
