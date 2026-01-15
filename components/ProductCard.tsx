"use client";

import Link from "next/link";
import Image from "next/image";
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
  isNew?: boolean;
  size?: string;
}

export default function ProductCard({ id, name, price, image, slug, soldOut, isNew, size }: ProductCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: generateId(),
      productId: id,
      productName: name,
      quantity: 1,
      price,
      image,
      slug,
    });
  };

  return (
    <div className="group">
      <Link href={`/products/${slug}`} className="block">
        <div
          className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden mb-3"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {isNew && !soldOut && (
            <div
              className="absolute top-3 left-3"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '10px',
                fontWeight: 500
              }}
            >
              <span className="bg-black text-white px-2 py-1 uppercase tracking-wide">
                New
              </span>
            </div>
          )}

          {soldOut && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span
                className="text-black uppercase tracking-wide"
                style={{
                  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                  fontSize: '11px',
                  fontWeight: 500
                }}
              >
                Sold Out
              </span>
            </div>
          )}

          {!soldOut && isHovered && (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-0 left-0 right-0 bg-black text-white py-3 text-center uppercase tracking-wide transition-opacity duration-200"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 500
              }}
            >
              Quick Add
            </button>
          )}
        </div>
      </Link>

      <div className="space-y-1">
        <Link href={`/products/${slug}`}>
          <h3
            className="uppercase tracking-wide hover:opacity-60 transition-opacity"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            {name}
          </h3>
        </Link>
        {size && (
          <p
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '11px',
              fontWeight: 400,
              color: '#666'
            }}
          >
            {size}
          </p>
        )}
        <p
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            fontSize: '11px',
            fontWeight: 400
          }}
        >
          ${price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
