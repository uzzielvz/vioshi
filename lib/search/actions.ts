'use server';

import { getProducts } from '@/lib/products';
import { topBrands } from '@/lib/topBrands';

/** Brands with the most pieces for sale, for the search screen. */
export async function getSearchBrandsAction(): Promise<string[]> {
  const products = await getProducts();
  return topBrands(
    products.map((p) => p.brand?.name),
    24
  );
}
