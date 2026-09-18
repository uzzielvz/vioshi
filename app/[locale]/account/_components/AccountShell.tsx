'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/i18n';
import { signOutAction } from '../actions';

const FONT: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

interface NavItem {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}

function buildNav(locale: Locale): NavItem[] {
  return [
    {
      href: `/${locale}/account`,
      label: 'Overview',
      match: (p) => p === `/${locale}/account` || p === `/${locale}/account/`,
    },
    {
      href: `/${locale}/account/orders`,
      label: 'Pedidos',
      match: (p) => p.startsWith(`/${locale}/account/orders`),
    },
    {
      href: `/${locale}/wishlist`,
      label: 'Wishlist',
      match: (p) => p.startsWith(`/${locale}/wishlist`),
    },
    {
      href: `/${locale}/account/addresses`,
      label: 'Direcciones',
      match: (p) => p.startsWith(`/${locale}/account/addresses`),
    },
    {
      href: `/${locale}/account/profile`,
      label: 'Perfil',
      match: (p) => p.startsWith(`/${locale}/account/profile`),
    },
  ];
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block text-[11px] uppercase tracking-widest transition-opacity ${
        active
          ? 'text-black font-semibold'
          : 'text-gray-400 hover:text-black hover:opacity-80'
      }`}
    >
      {label}
    </Link>
  );
}

export default function AccountShell({
  locale,
  displayName,
  email,
  children,
}: {
  locale: Locale;
  displayName: string;
  email: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? '';
  const nav = buildNav(locale);

  return (
    <div className="min-h-screen bg-white pt-16" style={FONT}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:gap-12 lg:gap-16">
          {/* Sidebar */}
          <aside className="md:w-48 lg:w-56 flex-shrink-0 mb-8 md:mb-0">
            <div className="mb-6 md:mb-8 pb-4 border-b border-gray-200">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-black truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-gray-400 mt-1 truncate">{email}</p>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex flex-col gap-4">
              {nav.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={item.match(pathname)}
                />
              ))}
              <form action={signOutAction} className="pt-2 mt-2 border-t border-gray-100">
                <input type="hidden" name="locale" value={locale} />
                <button
                  type="submit"
                  className="text-[11px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                >
                  Cerrar sesión
                </button>
              </form>
            </nav>

            {/* Mobile nav */}
            <nav className="md:hidden -mx-4 px-4 overflow-x-auto">
              <div className="flex items-center gap-5 pb-3 border-b border-gray-200 min-w-max">
                {nav.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-[10px] uppercase tracking-widest whitespace-nowrap pb-3 -mb-px border-b-2 transition-colors ${
                        active
                          ? 'border-black text-black font-semibold'
                          : 'border-transparent text-gray-400 hover:text-black'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <form action={signOutAction} className="pb-3">
                  <input type="hidden" name="locale" value={locale} />
                  <button
                    type="submit"
                    className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black whitespace-nowrap"
                  >
                    Salir
                  </button>
                </form>
              </div>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
