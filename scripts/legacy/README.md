# Scripts legacy

Scripts obsoletos conservados solo como referencia histórica. **No usar en flujos actuales.**

| Script | Motivo | Reemplazo |
|--------|--------|-----------|
| `seed-visual-search.ts` | Seed con URLs Unsplash; varias devolvían 404 | [`../seed-real-images.ts`](../seed-real-images.ts) |

## Seed activo (búsqueda visual)

```bash
npx tsx scripts/seed-real-images.ts
npx tsx scripts/generate-embeddings.ts
```
