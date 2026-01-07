export type Cart = {
  id?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  promoCode?: string;
  discount?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  image: string;
  slug?: string;
};

