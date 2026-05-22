import type { CartItem } from '@/types';
import type { createAdminClient } from '@/lib/supabase/admin';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isProductUuid(id: string): boolean {
  return UUID_RE.test(id);
}

type SupabaseAdmin = ReturnType<typeof createAdminClient>;

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price_mxn: string;
};

export type ReconcileCartResult =
  | { ok: true; items: CartItem[] }
  | { ok: false; message: string };

/**
 * Normalizes cart lines from localStorage (legacy slug ids) to current DB UUIDs + prices.
 */
export async function reconcileCartItems(
  supabase: SupabaseAdmin,
  cartItems: CartItem[]
): Promise<ReconcileCartResult> {
  if (cartItems.length === 0) {
    return { ok: false, message: 'Cart is empty' };
  }

  const uuidItems = cartItems.filter((i) => isProductUuid(i.productId));
  const legacyItems = cartItems.filter((i) => !isProductUuid(i.productId));

  const byId = new Map<string, ProductRow>();
  const bySlug = new Map<string, ProductRow>();

  if (uuidItems.length > 0) {
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name, price_mxn')
      .in(
        'id',
        uuidItems.map((i) => i.productId)
      );

    if (error) return { ok: false, message: error.message };
    data?.forEach((p) => byId.set(p.id, p));
  }

  if (legacyItems.length > 0) {
    const slugs = legacyItems.map((i) => (i.slug?.trim() || i.productId).toLowerCase());
    const { data, error } = await supabase
      .from('products')
      .select('id, slug, name, price_mxn')
      .in('slug', slugs);

    if (error) return { ok: false, message: error.message };
    data?.forEach((p) => bySlug.set(p.slug.toLowerCase(), p));
  }

  const normalized: CartItem[] = [];

  for (const item of cartItems) {
    const row = isProductUuid(item.productId)
      ? byId.get(item.productId)
      : bySlug.get((item.slug?.trim() || item.productId).toLowerCase());

    if (!row) {
      return {
        ok: false,
        message: `Producto no encontrado en catálogo: ${item.productName}. Vacía el carrito y vuelve a agregar.`,
      };
    }

    normalized.push({
      ...item,
      productId: row.id,
      productName: row.name,
      price: Number(row.price_mxn),
      slug: row.slug,
    });
  }

  return { ok: true, items: normalized };
}
