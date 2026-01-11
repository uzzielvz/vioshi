import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  soldOut?: boolean;
  isNew?: boolean;
}

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p
          className="uppercase tracking-wide"
          style={{
            fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
            fontSize: '11px',
            fontWeight: 500
          }}
        >
          No products available
        </p>
      </div>
    );
  }

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 md:gap-6`}>
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
        />
      ))}
    </div>
  );
}
