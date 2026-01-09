"use client";

import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  soldOut?: boolean;
  variants?: {
    size?: string[];
    color?: string[];
  };
}

export default function ProductCard({ 
  id, 
  name, 
  price, 
  image, 
  slug, 
  soldOut,
  variants 
}: ProductCardProps) {
  const colorCount = variants?.color?.length || 0;

  return (
    <Link href={`/products/${slug}`} className="group block">
      {/* Imagen del producto */}
      <div className="relative aspect-square bg-white mb-3 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-opacity duration-200 group-hover:opacity-80"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {soldOut && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <span 
              className="uppercase"
              style={{
                fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '-0.01em'
              }}
            >
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div>
        <h3 
          className="mb-1 uppercase group-hover:opacity-60 transition-opacity"
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            fontStretch: 'condensed'
          }}
        >
          {name}
        </h3>
        
        {/* Indicador de colores disponibles */}
        {colorCount > 1 && (
          <p 
            className="text-gray-600 mb-1"
            style={{
              fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
              fontSize: '10px',
              fontWeight: 400,
              letterSpacing: '-0.01em'
            }}
          >
            {colorCount} Colors
          </p>
        )}
        
        <p 
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '-0.01em'
          }}
        >
          ${price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
