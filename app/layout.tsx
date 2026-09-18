import type { Metadata } from "next";
import { brand } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: {
    default: brand.titleDefault,
    template: `%s | ${brand.name}`,
  },
  description: brand.descriptionDefault,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: brand.name,
    title: brand.titleDefault,
    description: brand.descriptionDefault,
  },
  twitter: {
    card: "summary_large_image",
    title: brand.titleDefault,
    description: brand.descriptionDefault,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The [locale]/layout.tsx provides <html> and <body>
  return children;
}
