import { brand } from '@/lib/brand';

// App constants — name/social come from brand (env-overridable)
export const APP_NAME = brand.name;
export const APP_DESCRIPTION = brand.tagline;

// URLs
export const INSTAGRAM_URL = brand.instagramUrl;

// Pagination
export const PRODUCTS_PER_PAGE = 12;
export const MAX_PRODUCTS_PER_PAGE = 48;

// Cart
export const MAX_CART_ITEMS = 50;
export const MIN_CHECKOUT_AMOUNT = 10;
export const FREE_SHIPPING_THRESHOLD = 100;

// Currency
export const CURRENCY = "MXN";
export const CURRENCY_SYMBOL = "$";

// IVA: los precios al público ya lo incluyen. No se suma en checkout ni se muestra.
// Se deja la constante por si más adelante hace falta desglose contable interno.
export const TAX_RATE = 0.16;

// Shipping
// STANDARD_SHIPPING_COST ya no es la fuente del checkout (paquete A1): el
// domicilio lee `settings.home_shipping_mxn` vía lib/settings.ts. Queda como
// fallback inicial en el cliente mientras carga y como respaldo si la DB falla.
export const STANDARD_SHIPPING_COST = 10;
export const EXPRESS_SHIPPING_COST = 20;

// Delivery Methods
export const DELIVERY_METHODS = {
  HOME: 'home',
  PICKUP: 'pickup',
} as const;

export const DELIVERY_METHOD_LABELS = {
  home: 'Envío a Domicilio',
  pickup: 'Recoger en Punto',
} as const;

// Categories — aligned with actual product data in lib/products.ts
export const CATEGORIES = {
  ALL: "all",
  PLAYERAS: "playeras",
  HOODIE: "hoodie",
  CHAMARRA: "chamarra",
  CAMISAS: "camisas",
  PANTS: "pants",
  JEANS: "jeans",
  ACCESORIOS: "accesorios",
  BOLSOS: "bolsos",
} as const;

export type CategorySlug = typeof CATEGORIES[keyof typeof CATEGORIES];

// Sort options
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
] as const;

// Payment
export const PAYPAL_ME_LINK = 'https://paypal.me/viogi';

// Local storage keys
export const STORAGE_KEYS = {
  CART: "viogi_cart",
  WISHLIST: "viogi_wishlist",
  RECENT_PRODUCTS: "viogi_recent_products",
} as const;

