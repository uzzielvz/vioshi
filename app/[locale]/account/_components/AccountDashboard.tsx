import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import type { Locale } from '@/i18n';
import { signOutAction } from '../actions';

const FONT: React.CSSProperties = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};

const LOGO: React.CSSProperties = {
  ...FONT,
  textShadow: '0 0 0.5px rgba(0,0,0,0.8)',
};

function getDisplayName(user: User, profileName: string | null): string {
  if (profileName && profileName.trim()) return profileName.trim();
  const meta = user.user_metadata as Record<string, unknown> | null;
  const fullName = typeof meta?.full_name === 'string' ? meta.full_name.trim() : '';
  if (fullName) return fullName;
  return user.email ?? 'Usuario';
}

interface DashboardLink {
  href: string;
  title: string;
  description: string;
}

export default function AccountDashboard({
  user,
  profileName,
  locale,
}: {
  user: User;
  profileName: string | null;
  locale: Locale;
}) {
  const displayName = getDisplayName(user, profileName);

  const links: DashboardLink[] = [
    {
      href: `/${locale}/account/profile`,
      title: 'Mi Perfil',
      description: 'Datos personales y contacto',
    },
    {
      href: `/${locale}/account/orders`,
      title: 'Mis Pedidos',
      description: 'Historial de compras y tracking',
    },
    {
      href: `/${locale}/account/addresses`,
      title: 'Mis Direcciones',
      description: 'Direcciones de envío guardadas',
    },
    {
      href: `/${locale}/wishlist`,
      title: 'Wishlist',
      description: 'Productos guardados para después',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10" style={FONT}>
      <div className="max-w-2xl mx-auto bg-gray-50 px-8 py-10">
        <div className="text-center mb-8">
          <span className="text-lg font-bold" style={LOGO}>VIOGI</span>
        </div>

        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
            Hola
          </p>
          <p className="text-base font-semibold uppercase tracking-wide text-black">
            {displayName}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block bg-white border border-gray-200 px-5 py-4 hover:border-black transition-colors"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-black mb-1">
                {link.title}
              </p>
              <p className="text-[10px] text-gray-400">{link.description}</p>
            </Link>
          ))}
        </div>

        <form action={signOutAction}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            className="w-full border border-gray-300 py-2.5 text-[11px] uppercase tracking-wide hover:border-black transition-colors"
          >
            Cerrar Sesión
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href={`/${locale}`}
            className="text-[10px] uppercase tracking-widest text-gray-300 hover:text-black transition-colors"
          >
            ← Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}
