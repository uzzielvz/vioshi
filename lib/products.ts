export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  description?: string;
  category?: string;
  soldOut?: boolean;
  isNew?: boolean;
  variants?: {
    size?: string[];
    color?: string[];
  };
}

export async function getProducts(category?: string): Promise<Product[]> {
  const products: Product[] = [
    // NUEVO DROP
    {
      id: "1",
      name: "HOODIE OVERSIZE BLACK",
      price: 1450,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
      slug: "hoodie-oversize-black",
      category: "new",
      description: "Hoodie oversize negro de algodón premium",
      isNew: true,
    },
    {
      id: "2",
      name: "CHAMARRA BOMBER",
      price: 2200,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
      slug: "chamarra-bomber",
      category: "new",
      description: "Chamarra bomber con forro interior",
      isNew: true,
    },
    // HOODIES
    {
      id: "3",
      name: "HOODIE CLASSIC GREY",
      price: 1350,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
      slug: "hoodie-classic-grey",
      category: "hoodie",
      description: "Hoodie clásico gris con capucha",
    },
    {
      id: "4",
      name: "HOODIE ZIP UP",
      price: 1500,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
      slug: "hoodie-zip-up",
      category: "hoodie",
      description: "Hoodie con cierre frontal",
    },
    // CHAMARRAS
    {
      id: "5",
      name: "CHAMARRA DENIM",
      price: 1800,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
      slug: "chamarra-denim",
      category: "chamarra",
      description: "Chamarra de mezclilla clásica",
    },
    {
      id: "6",
      name: "CHAMARRA COACH",
      price: 1650,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
      slug: "chamarra-coach",
      category: "chamarra",
      description: "Chamarra coach ligera",
    },
    // PANTS
    {
      id: "7",
      name: "PANTS CARGO BLACK",
      price: 1200,
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=800&fit=crop",
      slug: "pants-cargo-black",
      category: "pants",
      description: "Pantalón cargo negro con bolsillos",
    },
    {
      id: "8",
      name: "PANTS WIDE LEG",
      price: 1100,
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=800&fit=crop",
      slug: "pants-wide-leg",
      category: "pants",
      description: "Pantalón wide leg corte relajado",
    },
    // JEANS
    {
      id: "9",
      name: "JEANS STRAIGHT FIT",
      price: 1300,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
      slug: "jeans-straight-fit",
      category: "jeans",
      description: "Jeans corte recto clásico",
    },
    {
      id: "10",
      name: "JEANS BAGGY",
      price: 1400,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
      slug: "jeans-baggy",
      category: "jeans",
      description: "Jeans baggy fit",
    },
    // CAMISAS
    {
      id: "11",
      name: "CAMISA OXFORD",
      price: 950,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop",
      slug: "camisa-oxford",
      category: "camisas",
      description: "Camisa oxford manga larga",
    },
    {
      id: "12",
      name: "CAMISA OVERSHIRT",
      price: 1100,
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop",
      slug: "camisa-overshirt",
      category: "camisas",
      description: "Overshirt de algodón grueso",
    },
    // PLAYERAS
    {
      id: "13",
      name: "PLAYERA BÁSICA",
      price: 450,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      slug: "playera-basica",
      category: "playeras",
      description: "Playera básica algodón 100%",
    },
    {
      id: "14",
      name: "PLAYERA GRAPHIC",
      price: 550,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      slug: "playera-graphic",
      category: "playeras",
      description: "Playera con estampado gráfico",
    },
    {
      id: "15",
      name: "PLAYERA OVERSIZE",
      price: 500,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      slug: "playera-oversize",
      category: "playeras",
      description: "Playera oversize fit",
      soldOut: true,
    },
    // ACCESORIOS
    {
      id: "16",
      name: "GORRA SNAPBACK",
      price: 450,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop",
      slug: "gorra-snapback",
      category: "accesorios",
      description: "Gorra snapback ajustable",
    },
    {
      id: "17",
      name: "BEANIE",
      price: 350,
      image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&h=800&fit=crop",
      slug: "beanie",
      category: "accesorios",
      description: "Beanie de punto",
    },
    // BOLSOS
    {
      id: "18",
      name: "TOTE BAG",
      price: 650,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
      slug: "tote-bag",
      category: "bolsos",
      description: "Tote bag de canvas",
    },
    {
      id: "19",
      name: "CROSSBODY BAG",
      price: 750,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
      slug: "crossbody-bag",
      category: "bolsos",
      description: "Bolso crossbody compacto",
    },
    {
      id: "20",
      name: "BACKPACK",
      price: 1200,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop",
      slug: "backpack",
      category: "bolsos",
      description: "Mochila de canvas resistente",
    },
  ];

  if (category === "new") {
    return products.filter((p) => p.isNew || p.category === "new");
  }

  if (category) {
    return products.filter((p) => p.category === category);
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) || null;
}

