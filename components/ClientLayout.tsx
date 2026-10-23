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

export function ClientLayout({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
}) {
  const path = getPathWithoutLocale(usePathname());
  const isCheckout = path.includes('/checkout');
  const isAccount = path.startsWith('/account');
  const showBottomNav = !isCheckout && !isAccount;

  return (
    // The bottom nav is fixed on phones; the padding keeps the footer visible above it.
    <div className={clsx('flex min-h-screen flex-col', showBottomNav && 'pb-[60px] md:pb-0')}>
      {!isAccount && <Header userEmail={userEmail ?? null} />}
      <main className={clsx('flex-1', !isAccount && 'pt-14 md:pt-16')}>{children}</main>
      {!isCheckout && !isAccount && <Footer />}
      {showBottomNav && <BottomNav />}
      <CartDrawer />
    </div>
  );
}
