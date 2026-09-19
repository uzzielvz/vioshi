# CLAUDE.md

Streetwear de segunda mano → tienda hoy, marketplace después. Next.js 14 App Router, TypeScript strict, Tailwind, next-intl, Supabase, Stripe Checkout Sessions.

## Qué leer

| Doc | Rol |
|---|---|
| [`docs/agents/README.md`](./docs/agents/README.md) | **OS de agentes** — empieza aquí |
| [`AGENTS.md`](./AGENTS.md) | Carriles y serialización |
| [`docs/agents/STATUS.md`](./docs/agents/STATUS.md) | Estado real del código |
| [`docs/agents/FROZEN.md`](./docs/agents/FROZEN.md) | Decisiones que no se reabren |

Docs largos de 2026-05 y la auditoría del 31 ago están en [`docs/archive/`](./docs/archive/README.md). No son SSOT.

Si un doc contradice el código, **gana el código**.

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm run type-check
```

## Convenciones

- `"use client"` solo con interactividad / hooks / APIs de browser
- Header `fixed top-0` — el shell ya compensa; no dupliques `pt-16` sin mirar `ClientLayout`
- Imports `@/`
- `clsx` para clases condicionales
- Copy de producto en español; código y comentarios en inglés
- Comentarios solo en lógica no obvia

## Datos y marca

- Catálogo: `lib/products.ts` (cache 60s, tag `products`). Nunca `owner` / `cost_mxn` / `select('*')`
- Carrito: `store/cartStore.tsx` + `viogi_cart`
- Nombre de plataforma: `lib/brand.ts` + `NEXT_PUBLIC_BRAND_*`. Viogi (tienda) es copy aparte
- IVA: no sumar, no mostrar, `tax_mxn = 0`
