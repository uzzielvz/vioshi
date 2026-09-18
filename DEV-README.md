# VIOGI — repo

Tienda de streetwear de segunda mano. Next.js 14 + Supabase + Stripe Checkout Sessions.  
Rumbo: plataforma/marketplace con Viogi como tienda ancla.

## Documentación (este orden)

| Doc | Propósito |
|---|---|
| [`docs/agents/README.md`](./docs/agents/README.md) | OS de agentes |
| [`docs/agents/STATUS.md`](./docs/agents/STATUS.md) | Qué hay / qué falta |
| [`AGENTS.md`](./AGENTS.md) | Carriles |
| [`docs/ESQUEMA-REAL.md`](./docs/ESQUEMA-REAL.md) | Schema prod (hasta 0011) |

Históricos: [`docs/archive/`](./docs/archive/README.md).

Negocio: Obsidian `70_Trabajo/Viogi`.

## Stack

- Next.js 14 App Router, TypeScript strict, Tailwind, next-intl (es/en)
- Supabase (Postgres + Auth + Storage + pgvector)
- Stripe Checkout Sessions (tarjeta, OXXO, SPEI)
- `@google/genai` (visual search + admin studio)
- Carrito: Context + localStorage

## Comandos

```bash
npm run dev
npm run build
npm run lint
npm run type-check
npm run stripe:listen
npm run test:stock
npm run test:checkout
```

## Estructura corta

```
app/[locale]/     tienda + i18n
app/admin/        panel (cookie ADMIN_SECRET)
app/api/          visual-search + webhooks/stripe
lib/              products, pickup, brand, orders, stripe
supabase/migrations/   0001–0015
docs/agents/      tablero para agentes
```

Instagram tienda: [@viogi_](https://www.instagram.com/viogi_/)
