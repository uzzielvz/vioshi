# Paquete D — Tiendas (L4)

**Estado:** LISTO  
**Carril:** L4  
**Migración asignada:** `0016_stores.sql`  
**No hagas:** Connect, comisión, registro abierto, tocar webhooks.

## Objetivo

Que el schema y la UI sepan que Viogi es **una tienda**. Una sola tienda sembrada (`viogi`). Mario sigue siendo `owner` interno, no una `store`.

## Archivos permitidos

- `supabase/migrations/0016_stores.sql` (crear)
- `app/[locale]/tienda/` (crear: `page` listado opcional, `[slug]/page.tsx`)
- `app/[locale]/vender/page.tsx` + `app/[locale]/vender/actions.ts` (crear action)
- `lib/products.ts` — solo añadir `store_id` / join `stores` al select público
- `lib/stores.ts` (crear: `getStoreBySlug`, `getActiveStores`)
- `app/[locale]/products/[slug]/ProductContent.tsx` — etiqueta “Vendido por”
- `types/` — tipo `Store` mínimo si hace falta
- `messages/es.json` + `messages/en.json` — keys nuevas de tienda/vender
- `docs/agents/STATUS.md` — marcar D hecho al cerrar

## Archivos prohibidos

Todo lo demás. En especial: `checkout/**`, `api/webhooks/**`, `lib/orders.ts`, `lib/stripe.ts`, `middleware.ts`, `package.json`, `app/admin/studio/**`.

Si necesitas un selector `store_id` en el admin de productos: **no**. En Fase 1 todo producto es Viogi (default de columna). Eso es L5 después, en serie.

## Schema mínimo

`stores`: `id`, `slug` unique, `name`, `bio`, `logo_url`, `instagram`, `status` (`draft|active|paused`), `stripe_account_id` nullable (para L7, **no exponer a anon**), `created_at`.

Sembrar **solo**:

- `slug = 'viogi'`
- `name = 'Viogi'`
- `status = 'active'`
- instagram actual de la tienda (`https://www.instagram.com/viogi_/`)

`products.store_id` → FK `stores(id)`, backfill a Viogi, luego `NOT NULL`.

`store_applications`: campos del form actual de `/vender` + `status` (`pending|approved|rejected`) + `created_at`. RLS: insert vía Server Action con service role; anon no lee la tabla.

Recuerda `0011`: `store_id` es público → `GRANT SELECT (store_id)` a `anon`/`authenticated` en el mismo archivo `0016`. `stripe_account_id` no se concede.

## UI

- `/[locale]/tienda/viogi` — logo, bio, IG, `ProductGrid` de sus prendas (reusa el grid).
- Ficha: “Vendido por Viogi” linkeando a `/tienda/viogi`.
- `/vender`: deja de fingir el submit. Inserta `store_applications` con `pending`. Sin auto-aprobar. Sin crear `stores`.

## DoD

- [ ] `0016` aplicada en local/SQL Editor (el humano corre prod)
- [ ] Productos existentes tienen `store_id` de Viogi
- [ ] `/es/tienda/viogi` lista prendas
- [ ] Ficha muestra “Vendido por”
- [ ] `/vender` deja una fila `pending` (verificar en Supabase)
- [ ] `lib/products.ts` sigue sin `owner` / `cost_mxn` / `select('*')`
- [ ] `npm run type-check` y `npm run lint`
- [ ] Un commit: `feat(stores): Viogi as first store + persist seller applications`

## Fuera de alcance

Aprobar solicitudes en admin, onboarding Stripe, `/tienda` index de muchas tiendas (una sola basta), cambiar el header a “marketplace”.
