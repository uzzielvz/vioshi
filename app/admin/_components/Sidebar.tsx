'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const navFont = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
  fontSize: '11px',
}

export default function Sidebar() {
  const pathname = usePathname()
  const isProducts = pathname.startsWith('/admin/products')
  const isPickup   = pathname.startsWith('/admin/pickup-points')

  return (
    <aside className="w-60 bg-black flex flex-col min-h-screen px-6 py-8 shrink-0">
      <Link href="/es" className="mb-8">
        <div className="font-logo tracking-widest text-white leading-none" style={{ fontSize: '18px' }}>
          VIOGI
        </div>
        <div
          className="uppercase tracking-widest text-white/40 mt-0.5"
          style={{ fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif", fontSize: '10px' }}
        >
          ADMIN
        </div>
      </Link>

      <div className="border-b border-white/10 mb-6" />

      <nav className="flex flex-col gap-4">
        <Link
          href="/admin/products"
          className={`uppercase tracking-widest transition-colors duration-150 flex items-center gap-2 ${
            isProducts ? 'text-white' : 'text-white/40 hover:text-white'
          }`}
          style={navFont}
        >
          PRODUCTS
          {isProducts && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
        </Link>

        <Link
          href="/admin/pickup-points"
          className={`uppercase tracking-widest transition-colors duration-150 flex items-center gap-2 ${
            isPickup ? 'text-white' : 'text-white/40 hover:text-white'
          }`}
          style={navFont}
        >
          PICKUP POINTS
          {isPickup && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
        </Link>

        <span
          className="uppercase tracking-widest text-white/20 flex items-center gap-2"
          style={navFont}
          title="Coming soon"
        >
          ORDERS
          <span className="text-white/20">—</span>
        </span>
      </nav>

      <div className="mt-auto">
        <div className="border-b border-white/10 mb-6" />
        <LogoutButton />
      </div>
    </aside>
  )
}
