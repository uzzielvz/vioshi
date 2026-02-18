'use client';

import { useEffect, useState } from 'react';
import Header from "./Header";
import FooterTemp from "./FooterTemp";
import CartDrawer from "./CartDrawer";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

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

  return (
    <>
      <Header />
      <main className="pt-16">{children}</main>
      <FooterTemp />
      <CartDrawer />
    </>
  );
}
