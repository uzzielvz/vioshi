'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import LogoutButton from './LogoutButton'
import { brand } from '@/lib/brand'
import type { AdminActor } from '@/lib/admin/session'

/**
 * Navegación del panel. Dos formas, mismo contenido:
 *
 *   móvil  → barra sticky arriba + menú desplegable
 *   ≥ md   → columna negra fija de siempre
 *
 * La sidebar medía 240px sin breakpoint: en un teléfono de 390px se quedaba con
 * el 62% del ancho. El panel se usa de pie, capturando prendas con el celular,
 * así que móvil es el caso normal, no la excepción.
 */

const navFont = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
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

/** Alto mínimo 44px: es el objetivo táctil que no se falla con el pulgar. */
function MobileLink({ entry, onNavigate }: { entry: Entry; onNavigate: () => void }) {
  return (
    <Link
      href={entry.href}
      onClick={onNavigate}
      className={`uppercase tracking-widest flex items-center min-h-[44px] px-5 text-[13px] ${
        entry.active ? 'text-white' : 'text-white/50'
      }`}
      style={navFont}
    >
      {entry.label}
      {entry.active && <span className="ml-2 w-1.5 h-1.5 bg-white rounded-full" />}
    </Link>
  )
}

function DesktopLink({ entry }: { entry: Entry }) {
  return (
    <Link
      href={entry.href}
      className={`uppercase tracking-widest transition-colors duration-150 flex items-center gap-2 text-[11px] ${
        entry.active ? 'text-white' : 'text-white/40 hover:text-white'
      }`}
      style={navFont}
    >
      {entry.label}
      {entry.active && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
    </Link>
  )
}

export default function Sidebar({ actor }: { actor: AdminActor }) {
  const entries = useEntries(actor)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Cerrar al cambiar de ruta: si no, el menú tapa la página a la que acabas
  // de entrar.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const actorLabel = actor === 'mario' ? 'MARIO' : 'UZZIEL'
  const current = entries.find((e) => e.active)?.label ?? 'Panel'

  return (
    <>
      {/* ── Móvil ──────────────────────────────────────────────────────────── */}
      <header className="md:hidden sticky top-0 z-40 bg-black">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/admin" className="flex items-baseline gap-2 min-h-[44px] items-center">
            <span
              className="font-logo tracking-widest text-white leading-none"
              style={{ fontSize: '16px' }}
            >
              {brand.name}
            </span>
            <span
              className="uppercase tracking-widest text-white/40 text-[10px]"
              style={navFont}
            >
              {actorLabel}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="uppercase tracking-widest text-white min-h-[44px] min-w-[44px] flex items-center justify-end text-[11px]"
            style={navFont}
          >
            {open ? 'Cerrar' : current}
            <span className="ml-2 text-white/40">{open ? '×' : '≡'}</span>
          </button>
        </div>

        {open && (
          <nav className="border-t border-white/10 pb-2">
            {entries.map((entry) => (
              <MobileLink key={entry.href} entry={entry} onNavigate={() => setOpen(false)} />
            ))}
            <div className="border-t border-white/10 mt-2 pt-3 px-5">
              <LogoutButton />
            </div>
          </nav>
        )}
      </header>

      {/* ── Escritorio ─────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 bg-black flex-col h-full overflow-y-auto px-6 py-8 shrink-0">
        <Link href="/admin" className="mb-8">
          <div
            className="font-logo tracking-widest text-white leading-none"
            style={{ fontSize: '18px' }}
          >
            {brand.name}
          </div>
          <div
            className="uppercase tracking-widest text-white/40 mt-0.5 text-[10px]"
            style={navFont}
          >
            {actorLabel}
          </div>
        </Link>

        <div className="border-b border-white/10 mb-6" />

        <nav className="flex flex-col gap-4">
          <DesktopLink entry={entries[0]} />
          <DesktopLink entry={entries[1]} />
          {entries.length > 2 && (
            <>
              <div className="border-b border-white/10 my-2" />
              {entries.slice(2).map((entry) => (
                <DesktopLink key={entry.href} entry={entry} />
              ))}
            </>
          )}
        </nav>

        <div className="mt-auto">
          <div className="border-b border-white/10 mb-6" />
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}
