export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  description?: string;
  category?: string;
  soldOut?: boolean;
  variants?: {
    size?: string[];
    color?: string[];
  };
}

export async function getProducts(category?: string): Promise<Product[]> {
  const products: Product[] = [
    {
      id: "1",
      name: "CAMISETA BÁSICA",
      price: 450,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      slug: "camiseta-basica",
      category: "tees",
      description: "Camiseta básica de algodón 100%",
      variants: {
        size: ["XS", "S", "M", "L", "XL"],
        color: ["Negro", "Blanco", "Gris"]
      }
    },
    {
      id: "2",
      name: "HOODIE CLASSIC",
      price: 1200,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
      slug: "hoodie-classic",
      category: "outerwear",
      description: "Hoodie clásico con capucha",
      variants: {
        size: ["S", "M", "L", "XL", "XXL"],
        color: ["Negro", "Gris", "Navy"]
      }
    },
    {
      id: "3",
      name: "GORRA SNAPBACK",
      price: 350,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop",
      slug: "gorra-snapback",
      category: "accessories",
      description: "Gorra snapback ajustable",
      variants: {
        color: ["Negro", "Blanco", "Rojo"]
      }
    },
    {
      id: "4",
      name: "MOCHILA CANVAS",
      price: 800,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
      slug: "mochila-canvas",
      category: "accessories",
      description: "Mochila de canvas resistente",
      variants: {
        color: ["Negro", "Beige", "Navy"]
      }
    },
    {
      id: "5",
      name: "PANTALÓN CARGO",
      price: 950,
      image: "https://images.unsplash.com/photo-1506629905607-1c8b0a0b0b0b?w=800&h=800&fit=crop",
      slug: "pantalon-cargo",
      category: "pants",
      description: "Pantalón cargo con múltiples bolsillos",
      variants: {
        size: ["28", "30", "32", "34", "36"],
        color: ["Caqui", "Negro", "Verde Olivo"]
      }
    },
    {
      id: "6",
      name: "CAMISETA GRAPHIC",
      price: 550,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      slug: "camiseta-graphic",
      category: "tees",
      description: "Camiseta con estampado gráfico",
      soldOut: true,
      variants: {
        size: ["S", "M", "L", "XL"],
        color: ["Negro", "Blanco"]
      }
    },
    {
      id: "7",
      name: "BOLSO CROSSBODY",
      price: 650,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
      slug: "bolso-crossbody",
      category: "accessories",
      description: "Bolso crossbody de cuero",
      variants: {
        color: ["Negro", "Marrón", "Beige"]
      }
    },
    {
      id: "8",
      name: "CHAQUETA DENIM",
      price: 1500,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
      slug: "chaqueta-denim",
      category: "outerwear",
      description: "Chaqueta denim clásica",
      variants: {
        size: ["S", "M", "L", "XL"],
        color: ["Azul Claro", "Azul Oscuro", "Negro"]
      }
    },
  ];

  if (category) {
    return products.filter((p) => p.category === category);
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
}

