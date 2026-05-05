'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <main className="pt-16 min-h-screen">{children}</main>
      </>
    );
  }

  const path = getPathWithoutLocale(pathname);
  const isCheckout = path?.includes('/checkout');
  const isAccount = path?.startsWith('/account') || path?.includes('/account');

  return (
    <>
      {!isAccount && <Header userEmail={userEmail ?? null} />}
      <main className={!isAccount ? 'pt-16' : ''}>{children}</main>
      {!isCheckout && !isAccount && <Footer />}
      <CartDrawer />
    </>
  );
}
