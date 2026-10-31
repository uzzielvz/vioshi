/** Most frequent brands first (ties alphabetical), for the brand chips. */
export function topBrands(names: (string | null | undefined)[], limit = 5): string[] {
  const counts = new Map<string, number>();
  for (const name of names) if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name]) => name);
}
