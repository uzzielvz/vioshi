export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[]; // Gallery images
  slug: string;
  description?: string;
  category?: string;
  soldOut?: boolean;
  isNew?: boolean;
  size?: string;
  variants?: {
    size?: string[];
    color?: string[];
  };
}

export async function getProducts(category?: string): Promise<Product[]> {
  const products: Product[] = [
    // PLAYERAS / TEE
    {
      id: "1",
      name: "TEE STUSSY",
      price: 200,
      image: "/products/TEE STUSSY-S-200.png",
      slug: "tee-stussy-s",
      category: "playeras",
      size: "S",
      description: "Playera Stüssy talla S",
    },
    {
      id: "2",
      name: "TEE TACTIC STUSSY",
      price: 190,
      image: "/products/TEE TACTIC STUSSY-L-190.png",
      slug: "tee-tactic-stussy-l",
      category: "playeras",
      size: "L",
      description: "Playera Tactic Stüssy talla L",
    },
    {
      id: "3",
      name: "BENNIE STUSSY",
      price: 200,
      image: "/products/BENNIE STUSSY-UNISEX-200.png",
      slug: "bennie-stussy-unisex",
      category: "playeras",
      size: "UNISEX",
      description: "Playera Bennie Stüssy unisex",
    },

    // HOODIES
    {
      id: "4",
      name: "HOODIE PLAYBOY",
      price: 400,
      image: "/products/HOODIE PLAYBOY-M-400.png",
      images: [
        "/products/HOODIE PLAYBOY-M-400.png",
        "/products/HOODIE PLAYBOY-M-400.png",
        "/products/HOODIE PLAYBOY-M-400.png",
      ],
      slug: "hoodie-playboy-m",
      category: "hoodie",
      size: "M",
      description: "Hoodie Playboy talla M",
    },

    // CHAMARRAS
    {
      id: "5",
      name: "CHAMARRA ADIDAS FB",
      price: 500,
      image: "/products/CHAMARRA ADIDAS FB-L-500.png",
      slug: "chamarra-adidas-fb-l",
      category: "chamarra",
      size: "L",
      description: "Chamarra Adidas FB talla L",
    },
    {
      id: "6",
      name: "CHAMARRA ARSENAL NIKE",
      price: 500,
      image: "/products/CHAMARRA ARSENAL NIKE-XL-500.png",
      slug: "chamarra-arsenal-nike-xl",
      category: "chamarra",
      size: "XL",
      description: "Chamarra Arsenal Nike talla XL",
    },
    {
      id: "7",
      name: "CHAMARRA HALPUTT",
      price: 400,
      image: "/products/CHAMARRA HALPUTT-L-400.png",
      slug: "chamarra-halputt-l",
      category: "chamarra",
      size: "L",
      description: "Chamarra Halputt talla L",
    },
    {
      id: "8",
      name: "CHAMARRA NIKE SB",
      price: 700,
      image: "/products/CHAMARRA NIKE SB-L-700.png",
      slug: "chamarra-nike-sb-l",
      category: "chamarra",
      size: "L",
      description: "Chamarra Nike SB talla L",
    },

    // CAMISAS / JERSEY
    {
      id: "9",
      name: "JERSEY INGLATERRA 2002 NIKE",
      price: 350,
      image: "/products/JESEY INGLATERRA 2002 NIKE-S-350.png",
      slug: "jersey-inglaterra-2002-nike-s",
      category: "camisas",
      size: "S",
      description: "Jersey Inglaterra 2002 Nike talla S",
    },

    // PANTS
    {
      id: "10",
      name: "PANTS NIKE FB",
      price: 370,
      image: "/products/PANTS NIKE FB-L-370.png",
      slug: "pants-nike-fb-l",
      category: "pants",
      size: "L",
      description: "Pants Nike FB talla L",
    },

    // JEANS
    {
      id: "11",
      name: "JEANS WRANGLER",
      price: 250,
      image: "/products/JEANS WRANGLER-32x32- 250.png",
      slug: "jeans-wrangler-32x32",
      category: "jeans",
      size: "32x32",
      description: "Jeans Wrangler talla 32x32",
    },

    // ACCESORIOS
    {
      id: "12",
      name: "GORRA SUPREME",
      price: 500,
      image: "/products/GORRA SUPREME-500.png",
      slug: "gorra-supreme",
      category: "accesorios",
      description: "Gorra Supreme",
    },

    // BOLSOS
    {
      id: "13",
      name: "TNF BAG",
      price: 600,
      image: "/products/TNFBAG-600.png",
      slug: "tnf-bag",
      category: "bolsos",
      description: "The North Face Bag",
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
