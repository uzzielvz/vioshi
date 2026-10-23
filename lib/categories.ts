// Storefront category slugs, in menu order. Labels live in messages (ui.cats.*).
export const STORE_CATEGORIES = [
  "chamarra",
  "hoodie",
  "playeras",
  "camisas",
  "pants",
  "jeans",
  "accesorios",
  "bolsos",
] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number];
