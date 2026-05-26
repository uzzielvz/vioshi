'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import { VisualSearchProvider } from "@/store/visualSearchContext";

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
      <div className="flex flex-col min-h-screen">
        <main className="pt-16 flex-1">{children}</main>
      </div>
    );
  }

  const path = getPathWithoutLocale(pathname);
  const isCheckout = path?.includes('/checkout');
  const isAccount = path?.startsWith('/account') || path?.includes('/account');

  return (
    <div className="flex flex-col min-h-screen">
      <VisualSearchProvider>
        {!isAccount && <Header userEmail={userEmail ?? null} />}
        <main className={`flex-1 ${!isAccount ? 'pt-16' : ''}`}>{children}</main>
        {!isCheckout && !isAccount && <Footer />}
        <CartDrawer />
      </VisualSearchProvider>
    </div>
  );
}
