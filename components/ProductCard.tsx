"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/common/Button";
import { useCart } from "@/store/cartStore";
import { useState } from "react";
import { generateId } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  soldOut?: boolean;
}

export default function ProductCard({ id, name, price, image, slug, soldOut }: ProductCardProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    try {
      addItem({
        id: generateId(),
        productId: id,
        productName: name,
        quantity: 1,
        price,
        image,
        slug,
      });
      
      // Show feedback
      setTimeout(() => setIsAdding(false), 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setIsAdding(false);
    }
  };

  return (
    <div className="group">
      <Link href={`/products/${slug}`} className="block">
        <div className="relative aspect-square bg-[#EFEFEF] overflow-hidden mb-3">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-90"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {soldOut && (
            <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
              <span className="text-black text-sm uppercase tracking-wide font-normal">SOLD OUT</span>
            </div>
          )}
        </div>
      </Link>
      <div>
        <Link href={`/products/${slug}`}>
          <h3 className="text-sm font-normal tracking-wide mb-1 uppercase hover:opacity-70 transition-opacity">
            {name}
          </h3>
        </Link>
        <p className="text-sm font-normal mb-3">${price}</p>
        
        {!soldOut && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={handleAddToCart}
            loading={isAdding}
          >
            {isAdding ? "Added" : "Add to Cart"}
          </Button>
        )}
      </div>
    </div>
  );
}
