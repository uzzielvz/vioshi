import type { CartItem } from '@/types/cart';

/**
 * Every piece is one of a kind: one line per product, quantity 1.
 * Carts saved before the bag lost its +/- buttons can still carry
 * quantity 2, and the server must not trust whatever the browser sends.
 */
export function uniquePieces<T extends Pick<CartItem, 'productId' | 'quantity'>>(items: T[]): T[] {
  const byProduct = new Map<string, T>();
  for (const item of items) {
    if (!byProduct.has(item.productId)) byProduct.set(item.productId, { ...item, quantity: 1 });
  }
  return [...byProduct.values()];
}
