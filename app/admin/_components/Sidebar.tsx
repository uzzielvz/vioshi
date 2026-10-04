'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import { brand } from '@/lib/brand'
import type { AdminActor } from '@/lib/admin/session'

const navFont = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
  fontSize: '11px',
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`uppercase tracking-widest transition-colors duration-150 flex items-center gap-2 ${
        active ? 'text-white' : 'text-white/40 hover:text-white'
      }`}
      style={navFont}
    >
      {children}
      {active && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
    </Link>
  )
}

export default function Sidebar({ actor }: { actor: AdminActor }) {
  const pathname = usePathname()
  const isDashboard = pathname === '/admin'
  const isProducts = pathname.startsWith('/admin/products')
  const isStudio = pathname.startsWith('/admin/studio')
  const isPickup = pathname.startsWith('/admin/pickup-points')
  const isBrands = pathname.startsWith('/admin/brands')
  const isReservas = pathname.startsWith('/admin/reservas')
  const isFondos = pathname.startsWith('/admin/fondos')
  const isSettings = pathname.startsWith('/admin/settings')

  return (
    <aside className="w-60 bg-black flex flex-col h-full overflow-y-auto px-6 py-8 shrink-0">
      <Link href="/admin" className="mb-8">
        <div className="font-logo tracking-widest text-white leading-none" style={{ fontSize: '18px' }}>
          {brand.name}
        </div>
        <div
          className="uppercase tracking-widest text-white/40 mt-0.5"
          style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif", fontSize: '10px' }}
        >
          {actor === 'mario' ? 'MARIO' : 'UZZIEL'}
        </div>
      </Link>

      <div className="border-b border-white/10 mb-6" />

      <nav className="flex flex-col gap-4">
        <NavLink href="/admin" active={isDashboard}>
          Tablero
        </NavLink>
        <NavLink href="/admin/products" active={isProducts}>
          Inventario
        </NavLink>

        {actor === 'uzziel' && (
          <>
            <div className="border-b border-white/10 my-2" />
            <NavLink href="/admin/reservas" active={isReservas}>
              Pedidos
            </NavLink>
            <NavLink href="/admin/studio" active={isStudio}>
              Studio
            </NavLink>
            <NavLink href="/admin/pickup-points" active={isPickup}>
              Puntos de entrega
            </NavLink>
            <NavLink href="/admin/brands" active={isBrands}>
              Marcas
            </NavLink>
            <NavLink href="/admin/fondos" active={isFondos}>
              Fondos
            </NavLink>
            <NavLink href="/admin/settings" active={isSettings}>
              Parámetros
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto">
        <div className="border-b border-white/10 mb-6" />
        <LogoutButton />
      </div>
    </aside>
  )
}
