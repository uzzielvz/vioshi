'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
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

  const isCheckout = pathname?.includes('/checkout');
  const isAccount = pathname?.includes('/account');

  return (
    <>
      <Header />
      <main className="pt-16">{children}</main>
      {!isCheckout && !isAccount && <Footer />}
      <CartDrawer />
    </>
  );
}
