import type { Metadata } from "next";
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
  // The [locale]/layout.tsx provides <html> and <body>
  return children;
}
