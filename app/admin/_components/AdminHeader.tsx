'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import { brand } from '@/lib/brand'
import type { AdminActor } from '@/lib/admin/session'

/**
 * Navegación del panel.
 *
 * Es deliberadamente el mismo header de la tienda (components/Header.tsx):
 * fijo arriba, fondo blanco, altura 56px, logo a la izquierda y enlaces en
 * mayúsculas a 11px. Antes era una columna negra de 240px, y eso hacía que el
 * panel pareciera otra aplicación en vez de una sección más del sitio.
 *
 * En móvil los enlaces se desplazan en horizontal en lugar de esconderse tras
 * un menú desplegable: con seis entradas, un cajón es más estorbo que ayuda.
 */

const FONT = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
  letterSpacing: '0.02em',
  fontSize: '11px',
  textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)',
} as const

type Entry = { href: string; label: string; active: boolean }

export default function AdminHeader({ actor }: { actor: AdminActor }) {
  const pathname = usePathname()

  const entries: Entry[] = [
    { href: '/admin', label: 'Inventario', active: pathname === '/admin' },
    {
      href: '/admin/products',
      label: 'Prendas',
      active: pathname.startsWith('/admin/products'),
    },
    {
      href: '/admin/reportes',
      label: 'Reportes',
      active: pathname.startsWith('/admin/reportes'),
    },
    ...(actor === 'uzziel'
      ? [
          { href: '/admin/reservas', label: 'Pedidos', active: pathname.startsWith('/admin/reservas') },
          { href: '/admin/studio', label: 'Studio', active: pathname.startsWith('/admin/studio') },
          { href: '/admin/brands', label: 'Marcas', active: pathname.startsWith('/admin/brands') },
          {
            href: '/admin/pickup-points',
            label: 'Entregas',
            active: pathname.startsWith('/admin/pickup-points'),
          },
          { href: '/admin/fondos', label: 'Fondos', active: pathname.startsWith('/admin/fondos') },
          {
            href: '/admin/settings',
            label: 'Ajustes',
            active: pathname.startsWith('/admin/settings'),
          },
        ]
      : []),
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between gap-6 px-4 md:px-8 h-14">
        <Link
          href="/admin"
          className="text-lg font-bold text-black hover:opacity-60 transition-opacity duration-200 whitespace-nowrap shrink-0"
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)',
          }}
        >
          {brand.name}
        </Link>

        {/* `scrollbar-width: none` deja el desplazamiento sin barra visible. */}
        <nav
          className="flex items-center gap-6 overflow-x-auto flex-1 min-w-0"
          style={{ scrollbarWidth: 'none' }}
        >
          {entries.map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              className={`uppercase whitespace-nowrap transition-opacity duration-200 hover:opacity-60 ${
                entry.active ? 'text-black border-b border-black pb-0.5' : 'text-black/50'
              }`}
              style={FONT}
            >
              {entry.label}
            </Link>
          ))}
        </nav>

        <div className="shrink-0">
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
