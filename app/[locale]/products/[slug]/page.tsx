import { getProductBySlug, getProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductContent from "./ProductContent";

interface PageProps {
  params: {
    slug: string;
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
