import type { Metadata } from "next";
import { CartProvider } from "@/store/cartStore";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIOGI - Premium Accessible Streetwear",
  description: "Shop premium accessible streetwear made in Mexico. VIOGI offers high-quality casual clothing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}

