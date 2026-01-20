import Header from "@/components/Header";
import Footer from "@/components/Footer";
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

  // Get all products for navigation
  const allProducts = await getProducts();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <ProductContent product={product} allProducts={allProducts} />
      <Footer />
    </div>
  );
}
