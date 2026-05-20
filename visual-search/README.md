# VIOGI — Visual Search

Búsqueda visual por imagen para el catálogo Viogi. El usuario sube una foto de una prenda; el sistema describe la imagen con Gemini, genera un embedding vectorial y devuelve productos similares del catálogo vía pgvector.

**Estado:** funcional en demo (rama `feat/visual-search-gemini`). Pendiente hardening e integración en tienda — ver [`PLAN.md`](../PLAN.md) Fase 3.

---

## Arquitectura (implementación actual)

```
Usuario → /visual-search (UI)
       → POST /api/visual-search (multipart image)
       → gemini-2.5-flash (descripción en texto)
       → gemini-embedding-001 (768 dimensiones)
       → RPC match_products_by_image (pgvector, cosine)
       → hydrate product_images → JSON top-N
```

**Decisión:** se implementó **Opción A** (Gemini + Next.js). La **Opción B** (Python + CLIP / FastAPI) quedó descartada; rama legacy `feat/visual-search`.

---

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `supabase/migrations/0003_pgvector_and_embeddings.sql` | Columna `embedding vector(768)`, índice IVFFlat, RPC |
| `app/api/visual-search/route.ts` | Route Handler POST (validación MIME/size, Gemini, RPC) |
| `app/visual-search/page.tsx` | UI upload + preview + resultados |
| `app/visual-search/layout.tsx` | Shell `<html>/<body>` (root layout es passthrough) |
| `scripts/seed-real-images.ts` | Seed productos demo → Supabase Storage + DB |
| `scripts/generate-embeddings.ts` | Indexación offline de embeddings |
| `lib/supabase/admin.ts` | Cliente service role (server-only) |

---

## Variables de entorno

| Variable | Uso |
|----------|-----|
| `GEMINI_API_KEY` | Descripción + embeddings (AI Studio) |
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Lectura catálogo |
| `SUPABASE_SERVICE_ROLE_KEY` | RPC + hydrate en route handler |

---

## Setup e indexación

1. Aplicar migración `0003` en Supabase SQL Editor.
2. Configurar `.env.local` (ver `.env.example`).
3. Seed catálogo demo:

```bash
npx tsx scripts/seed-real-images.ts
```

4. Generar embeddings:

```bash
npx tsx scripts/generate-embeddings.ts
```

5. Probar en dev: `npm run dev` → http://localhost:3000/visual-search

---

## Modelos Gemini (mayo 2026)

| Paso | Modelo | Notas |
|------|--------|-------|
| Descripción | `gemini-2.5-flash` | Reemplaza `gemini-2.0-flash` (deprecado) |
| Embedding | `gemini-embedding-001` | `outputDimensionality: 768` |

SDK: `@google/genai` (no `@google/generative-ai`).

---

## Limitaciones conocidas

- Endpoint **público** sin rate limit (riesgo de costo Gemini en producción).
- Indexación **manual** vía CLI; no se genera embedding al crear producto en admin.
- Ruta `/visual-search` **fuera de i18n** (middleware la excluye).
- Prompt de indexación puede diferir del prompt de query (ver `PLAN.md` VS-01).
- Columna `embedding` expuesta por policy RLS pública (ver `PLAN.md` SEC-06).

---

## Material adicional

- `TMPI_4_2_efectividad.tex` — entrega académica (métricas, matriz cumplimiento)
- `VIOGI-Visual-Search-Modelo.docx` — documento de modelo inicial
