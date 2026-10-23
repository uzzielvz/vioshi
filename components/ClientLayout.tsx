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
  const route = path.replace(/\/$/, '');
  // The payment form, login and password screens run without the store shell
  // (they bring their own bar). Order pages after paying keep it.
  const isStandalone =
    route === '/checkout' ||
    AUTH_PATHS.some((p) => route.startsWith(p)) ||
    (route === '/account' && !userEmail);

  return (
    // The bottom nav is fixed on phones; the padding keeps the footer visible above it.
    <div className={clsx('flex min-h-screen flex-col', !isStandalone && 'pb-[60px] md:pb-0')}>
      {!isStandalone && <Header userEmail={userEmail ?? null} />}
      <main className={clsx('flex-1', !isStandalone && 'pt-14 md:pt-16')}>{children}</main>
      {!isStandalone && <Footer />}
      {!isStandalone && <BottomNav />}
      <CartDrawer />
    </div>
  );
}
