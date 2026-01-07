export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  images: ProductImage[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
  category: string;
  subcategory?: string;
  material?: string;
  careInstructions?: string;
  madeIn?: string;
  sku: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  soldOut?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
  sortOrder?: number;
};

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
  images?: string[];
};

export type ProductSize = {
  id: string;
  size: string;
  stock: number;
  sku?: string;
};

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
};

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  likes: number;
  createdAt: Date;
};

