import { STORAGE_KEYS } from '@/lib/constants';

// Per-device memory for the search screen. Storage can be missing or full
// (private mode), so every access is best effort.

export interface RecentProduct {
  id: string;
  slug: string;
  image: string;
  brand: string | null;
  name: string;
}

const MAX_PRODUCTS = 12;
const MAX_SEARCHES = 8;

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Full or blocked storage: the list just doesn't grow.
  }
}

export function getRecentProducts(): RecentProduct[] {
  return read<RecentProduct>(STORAGE_KEYS.RECENT_PRODUCTS).filter((p) => p && p.id && p.slug && p.image);
}

export function rememberProduct(product: RecentProduct) {
  const rest = getRecentProducts().filter((p) => p.id !== product.id);
  write(STORAGE_KEYS.RECENT_PRODUCTS, [product, ...rest].slice(0, MAX_PRODUCTS));
}

export function getRecentSearches(): string[] {
  return read<string>(STORAGE_KEYS.RECENT_SEARCHES).filter((q) => typeof q === 'string' && q.trim());
}

export function rememberSearch(query: string) {
  const q = query.trim();
  if (!q) return;
  const rest = getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
  write(STORAGE_KEYS.RECENT_SEARCHES, [q, ...rest].slice(0, MAX_SEARCHES));
}

export function forgetSearch(query: string): string[] {
  const next = getRecentSearches().filter((s) => s !== query);
  write(STORAGE_KEYS.RECENT_SEARCHES, next);
  return next;
}
