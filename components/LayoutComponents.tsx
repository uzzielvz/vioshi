'use client';

import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

export function LayoutComponents({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-16">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
