import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { ProductData } from '@/lib/products';

export const runtime = 'nodejs';

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_mxn: string;
  sold_out: boolean;
  is_new: boolean;
  product_images: { url: string; is_primary: boolean; sort_order: number }[];
  product_attributes: { key: string; value: string; sort_order: number }[];
  categories: { slug: string } | null;
};

function rowToProductData(row: DbProduct): ProductData {
  const sortedImages = [...(row.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const primaryImage = sortedImages.find((img) => img.is_primary);
  const image = primaryImage?.url ?? sortedImages[0]?.url ?? '';
  const images = sortedImages.map((img) => img.url);

  const attrs = [...(row.product_attributes ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(({ key, value }) => ({ key, value }));

  return {
    id: row.id,
    name: row.name,
    price: parseFloat(row.price_mxn),
    image,
    images: images.length > 1 ? images : undefined,
    slug: row.slug,
    description: row.description ?? undefined,
    category: row.categories?.slug ?? undefined,
    soldOut: row.sold_out,
    isNew: row.is_new,
    attributes: attrs.length > 0 ? attrs : undefined,
  };
}

// Escape % and _ to prevent ilike pattern abuse and \, for safety
function escapeIlike(s: string): string {
  return s.replace(/[\\%_,]/g, (c) => `\\${c}`);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();
  const sort = searchParams.get('sort') ?? 'newest';
  const category = searchParams.get('category') ?? 'all';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  let query = supabase.from('products').select(`
    id, slug, name, description, price_mxn, sold_out, is_new,
    product_images (url, is_primary, sort_order),
    product_attributes (key, value, sort_order),
    categories (slug)
  `);

  if (q.length > 0) {
    const safe = escapeIlike(q);
    query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  switch (sort) {
    case 'price_asc':
      query = query.order('price_mxn', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price_mxn', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error || !data) {
    return NextResponse.json({ products: [] satisfies ProductData[] });
  }

  const rows = data as unknown as DbProduct[];
  let products = rows.map(rowToProductData);

  if (category && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }

  return NextResponse.json({ products });
}
