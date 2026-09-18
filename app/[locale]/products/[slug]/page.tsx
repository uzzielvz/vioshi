import type { Metadata } from "next";
import { getProductBySlug, getProducts } from "@/lib/products";
import { brand } from "@/lib/brand";
import { notFound } from "next/navigation";
import ProductContent from "./ProductContent";

interface PageProps {
  params: {
    slug: string;
    locale?: string;
  };
}

function formatMxn(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: brand.name };

  const priceLabel = formatMxn(product.price);
  const title = `${product.name} — ${priceLabel}`;
  const description =
    product.description?.slice(0, 160) ||
    `${product.name} · Pieza única · ${brand.name}`;

  const imageUrl = product.image?.startsWith("http")
    ? product.image
    : product.image
      ? new URL(product.image, brand.siteUrl).toString()
      : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_MX",
      siteName: brand.name,
      images: imageUrl
        ? [{ url: imageUrl, width: 1080, height: 1350, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();

  return <ProductContent product={product} allProducts={allProducts} />;
}
