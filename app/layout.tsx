import type { Metadata, Viewport } from "next";
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
  // Installed from Safari, the site opens full screen like an app.
  appleWebApp: {
    capable: true,
    title: brand.name.toLowerCase(),
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  // Lets the bottom nav pad itself with env(safe-area-inset-bottom) when installed.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The [locale]/layout.tsx provides <html> and <body>
  return children;
}
