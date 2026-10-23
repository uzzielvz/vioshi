"use client";

import { useTranslations } from "next-intl";
import ProductCard from "./ProductCard";
import type { GarmentType } from "@/lib/garments";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  soldOut?: boolean;
  isNew?: boolean;
  size?: string;
  availability?: "disponible" | "apartada" | "vendida";
  reservedUntil?: string;
  brand?: { name: string };
  garmentType?: GarmentType;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const t = useTranslations("ui.card");

  if (products.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-[13px] text-muted">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-[2px] gap-y-[22px] md:grid-cols-3 md:gap-[14px] lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          price={product.price}
          image={product.image}
          slug={product.slug}
          soldOut={product.soldOut}
          isNew={product.isNew}
          size={product.size}
          availability={product.availability}
          brand={product.brand}
          garmentType={product.garmentType}
        />
      ))}
    </div>
  );
}
