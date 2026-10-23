import { Inter } from "next/font/google";

// One instance shared by the storefront and admin layouts.
export const inter = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-inter",
  display: "swap",
});
