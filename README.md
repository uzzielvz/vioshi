# VIOGI

E-commerce de streetwear de segunda mano. Next.js 14 + Supabase.

---

## Documentación

| Documento | Propósito |
|-----------|-----------|
| [`RESEARCH-CONSOLIDADO.md`](./RESEARCH-CONSOLIDADO.md) | SSOT — hechos técnicos verificados |
| [`PLAN.md`](./PLAN.md) | Roadmap vivo y backlog |
| [`CONTEXT.md`](./CONTEXT.md) | Mapa rápido del repositorio |

> Documentación histórica archivada en [`docs/archive/`](./docs/archive/README.md). No usar como referencia.

---

## Stack

- Next.js 14 (App Router)
- TypeScript (strict)
- Tailwind CSS
- next-intl (es / en)
- Supabase (PostgreSQL + Auth + Storage + pgvector)
- `@google/genai` (búsqueda visual)
- Stripe Payment Element (checkout)
- Context API + localStorage (carrito / wishlist)

## Comandos

```bash
npm run dev          # Desarrollo (http://localhost:3000)
npm run build        # Build producción
npm run lint         # ESLint
npm run type-check   # TypeScript
npm run stripe:listen   # Webhooks Stripe → localhost (requiere Stripe CLI)
npm run stripe:check-pi -- pi_xxx   # Estado de un PaymentIntent (debug)
```

## Estructura

```
app/[locale]/           # Rutas localizadas (es, en)
app/admin/              # Panel admin (cookie ADMIN_SECRET)
app/visual-search/      # UI búsqueda visual
app/api/visual-search/  # Route Handler POST
components/             # Componentes UI
store/                  # Carrito (Context API)
lib/                    # Productos, Supabase, utilidades
scripts/                # Seed catálogo + generación embeddings
supabase/migrations/    # Schema SQL (0001–0006)
messages/               # Traducciones (en.json, es.json)
types/                  # Tipos TypeScript
visual-search/          # Docs del módulo visual search
```

## Módulos

- Catálogo de productos (Supabase) con filtrado por categoría
- Carrito con persistencia en localStorage
- Checkout real (Stripe Payment Element → pedido en Supabase + webhook)
- Cuentas de usuario (Supabase Auth: email + Google OAuth)
- Panel admin — CRUD productos, imágenes, pickup points
- **Búsqueda visual** (Gemini + pgvector) — [`/visual-search`](http://localhost:3000/visual-search)
- Soporte, guía de tallas, envíos y devoluciones

## Scripts (búsqueda visual)

Requieren `.env.local` con `GEMINI_API_KEY` y claves Supabase.

```bash
npx tsx scripts/seed-real-images.ts    # Seed productos demo en Storage + DB
npx tsx scripts/generate-embeddings.ts # Genera embeddings vector(768) con Gemini
```

Ver [`visual-search/README.md`](./visual-search/README.md) para arquitectura completa.

---

Instagram: [@viogi_](https://www.instagram.com/viogi_/)
