# Paquete F — Operación admin (L5)

**Estado:** LISTO  
**Carril:** L5  
**No hagas:** Connect, transferencias Stripe, tocar checkout.

## Objetivo

1. Al **publicar** (crear/actualizar producto a la venta) se genera el embedding. Sin esto el buscador visual no ve prendas nuevas.
2. En admin de pedidos/reservas: marcar **entregado** (cambia estado de la orden). La transferencia Connect es L7, no este paquete.

## Archivos permitidos

- `app/admin/products/actions.ts`
- `app/admin/products/_components/ProductForm.tsx` (solo si hace falta un flag “publicar”)
- `scripts/generate-embeddings.ts` — **leer** el prompt; extraer función compartida si hace falta
- `lib/studio/` no. L8.
- `app/admin/reservas/**` y/o un `app/admin/orders/**` mínimo — botón “Entregado”
- `lib/orders.ts` **solo** si agregas `markOrderDelivered` sin cambiar lookups de checkout
- `messages` admin no tiene i18n; copy en español hardcodeado como el resto del admin está bien
- `docs/agents/STATUS.md`

## Archivos prohibidos

`checkout/**`, `api/webhooks/**`, `lib/stripe.ts`, `tienda/**`, `0016`, `middleware.ts`, `package.json`, `app/admin/studio/**`.

Si L4 está en vuelo sobre `lib/products.ts`, **espera**. No edites `lib/products.ts` en este paquete.

## Embeddings

- Reusa modelo y prompt de `scripts/generate-embeddings.ts` (`gemini-embedding-001`, 768 dims). No inventes otro prompt (eso era VS-01: unificar).
- Corre server-side con `GEMINI_API_KEY`. Si falla el embed, el producto **sí** se guarda; log + el admin ve un error no bloqueante (“publicado, embedding pendiente”).
- No expongas `embedding` al cliente.

## Entregado

- Nuevo status de orden o usa el existente (`orders.status`). Lee el check constraint real en `0001` / dumps antes de escribir un valor que el CHECK rechace.
- Un clic. Patrón `ToggleButton` / `SoldToggle` ya existe.
- **No** llames a Stripe. L7 enganchará este mismo status después.

## DoD

- [ ] Publicar prenda nueva → fila con `embedding` no null (o mensaje de pendiente visible)
- [ ] Admin puede marcar un pedido `delivered` (o el valor que permita el CHECK)
- [ ] Checkout y webhooks sin cambios
- [ ] `npm run type-check` && `npm run lint`
- [ ] Commit: `feat(admin): embed on publish and mark order delivered`

## Dependencia

Puede correr **en paralelo** a L4 si no tocas `lib/products.ts`.
