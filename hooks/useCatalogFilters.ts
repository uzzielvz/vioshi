'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DEFAULT_FILTERS, type SearchFilters, type SortKey } from '@/components/SearchFilterDrawer';
import type { ProductData } from '@/lib/products';

const SORT_KEYS: SortKey[] = ['newest', 'price_asc', 'price_desc'];

function isSortKey(v: string | null): v is SortKey {
  return !!v && (SORT_KEYS as string[]).includes(v);
}

// Sort, category, size and brand live in the URL so a filtered list can be
// shared. Used by search and by the profile listings.
export function useCatalogFilters(source: ProductData[]) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const sortParam = searchParams.get('sort');
  const filters: SearchFilters = {
    sort: isSortKey(sortParam) ? sortParam : 'newest',
    category: searchParams.get('category') ?? 'all',
    size: searchParams.get('size') ?? '',
    brand: searchParams.get('brand') ?? '',
  };

  // Size and brand options come from the list being filtered.
  const sizes = useMemo(
    () => Array.from(new Set(source.map((p) => p.size).filter((s): s is string => Boolean(s)))).sort(),
    [source]
  );
  const brands = useMemo(
    () =>
      Array.from(new Set(source.map((p) => p.brand?.name).filter((b): b is string => Boolean(b)))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [source]
  );

  const products = useMemo(() => {
    let list = source;
    if (filters.category !== 'all') list = list.filter((p) => p.category === filters.category);
    if (filters.size) list = list.filter((p) => p.size === filters.size);
    if (filters.brand) list = list.filter((p) => p.brand?.name === filters.brand);

    const sorted = [...list];
    if (filters.sort === 'price_asc') sorted.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price_desc') sorted.sort((a, b) => b.price - a.price);
    // 'newest': the catalog queries already return created_at desc.
    return sorted;
  }, [source, filters.category, filters.size, filters.brand, filters.sort]);

  function replaceParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function updateFilters(next: Partial<SearchFilters>) {
    replaceParams((params) => {
      for (const [key, value] of Object.entries(next)) {
        const isDefault = value === DEFAULT_FILTERS[key as keyof SearchFilters];
        if (isDefault || !value) params.delete(key);
        else params.set(key, value);
      }
    });
  }

  const hasFilters =
    filters.category !== 'all' || Boolean(filters.size) || Boolean(filters.brand) || filters.sort !== 'newest';

  return { filters, sizes, brands, products, hasFilters, updateFilters, replaceParams };
}
