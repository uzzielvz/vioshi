'use client';

import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import BottomNav from "./BottomNav";

function getPathWithoutLocale(path: string | null): string {
  if (!path) return '';
  return path.replace(/^\/[a-z]{2}(?=\/|$)/, '') || path;
}

const AUTH_PATHS = ['/account/register', '/account/forgot-password', '/account/reset'];

export function ClientLayout({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const path = getPathWithoutLocale(usePathname());
  const isCheckout = path.includes('/checkout');
  // Login and password screens are standalone; a signed-in profile keeps the shell.
  const isAuth =
    AUTH_PATHS.some((p) => path.startsWith(p)) || (path.replace(/\/$/, '') === '/account' && !userEmail);
  const showBottomNav = !isCheckout && !isAuth;

  return (
    // The bottom nav is fixed on phones; the padding keeps the footer visible above it.
    <div className={clsx('flex min-h-screen flex-col', showBottomNav && 'pb-[60px] md:pb-0')}>
      {!isAuth && <Header userEmail={userEmail ?? null} />}
      <main className={clsx('flex-1', !isAuth && 'pt-14 md:pt-16')}>{children}</main>
      {!isCheckout && !isAuth && <Footer />}
      {showBottomNav && <BottomNav />}
      <CartDrawer />
    </div>
  );
}
