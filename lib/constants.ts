// App constants
export const APP_NAME = "VIOGI";
export const APP_DESCRIPTION = "Premium Accessible Streetwear";

// URLs
export const INSTAGRAM_URL = "https://www.instagram.com/viogi_/?hl=es";

// Pagination
export const PRODUCTS_PER_PAGE = 12;
export const MAX_PRODUCTS_PER_PAGE = 48;

// Cart
export const MAX_CART_ITEMS = 50;
export const MIN_CHECKOUT_AMOUNT = 10;
export const FREE_SHIPPING_THRESHOLD = 100;

// Currency
export const CURRENCY = "USD";
export const CURRENCY_SYMBOL = "$";

// Tax rate (example: 10%)
export const TAX_RATE = 0.1;

// Shipping
export const STANDARD_SHIPPING_COST = 10;
export const EXPRESS_SHIPPING_COST = 20;

// Categories
export const CATEGORIES = {
  ALL: "all",
  TEES: "tees",
  OUTERWEAR: "outerwear",
  ACCESSORIES: "accessories",
  PANTS: "pants",
} as const;

export const CATEGORY_NAMES: Record<string, string> = {
  all: "New Arrivals",
  tees: "Tees",
  outerwear: "Outerwear",
  accessories: "Accessories",
  pants: "Pants",
};

// Sort options
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
] as const;

// Local storage keys
export const STORAGE_KEYS = {
  CART: "viogi_cart",
  WISHLIST: "viogi_wishlist",
  RECENT_PRODUCTS: "viogi_recent_products",
} as const;

