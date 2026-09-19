# Mapa del repo (2026-09-18)

Monorepo: no. Next.js plano.

## `app/`

| Ruta | Qué es |
|---|---|
| `app/[locale]/` | Tienda pública + i18n (`es` / `en`) |
| `app/[locale]/(shop)/cart/` | Carrito |
| `app/[locale]/checkout/` | Checkout + return + success |
| `app/[locale]/products/[slug]/` | Ficha |
| `app/[locale]/collections/[category]/` | Listados |
| `app/[locale]/search/` | Búsqueda texto |
| `app/[locale]/visual-search/` | UI búsqueda visual |
| `app/[locale]/vender/` | Formulario solicitud (aún no persiste) |
| `app/[locale]/account/` | Auth + pedidos + direcciones |
| `app/[locale]/pages/` | Legales / soporte / tallas / locaciones |
| `app/[locale]/archive/` | Drops (contenido aún en componente) |
| `app/admin/` | Panel cookie `ADMIN_SECRET` (no Supabase Auth) |
| `app/admin/products/` | CRUD catálogo |
| `app/admin/brands/` | Marcas |
| `app/admin/pickup-points/` | Puntos |
| `app/admin/reservas/` | Stock reservado |
| `app/admin/settings/` | `settings` de negocio |
| `app/admin/studio/` | Generación de fotos Gemini (carril L8, aislado) |
| `app/api/visual-search/` | POST Gemini + pgvector |
| `app/api/webhooks/stripe/` | Webhook de pago |
| `app/auth/callback/` | OAuth / magic link |

No existe: `app/[locale]/tienda/`.

## `lib/` — toca con cuidado

| Archivo | Dueño típico |
|---|---|
| `brand.ts` | L3 (cerrado) |
| `pickup.ts` | L2 (cerrado) |
| `orders.ts` | L1 |
| `constants.ts` | L1 (envío / IVA) |
| `settings.ts` | L1 + admin settings |
| `products.ts` | L4/L5 — consultas **públicas**, sin `owner`/`cost_mxn`/`select('*')` |
| `garments.ts` | L5 |
| `stripe.ts` | L1 / L7 |
| `supabase/*` | serializado si cambias clientes |

## Otros

| Path | Nota |
|---|---|
| `store/cartStore.tsx` | L1 |
| `messages/*.json` | i18n; un agente a la vez si toca las mismas keys |
| `supabase/migrations/` | un archivo, un número, un agente |
| `scripts/generate-embeddings.ts` | L5 / L6 — canon del prompt Gemini |
| `scripts/test-stock.mjs`, `test-checkout-flow.mjs` | smoke, no Vitest |
| `types/` | compartir; no dos modelos nuevos de Product |

## Serializado para siempre

`middleware.ts` · `package.json` · `package-lock.json` · `.env*` · número de migración.
