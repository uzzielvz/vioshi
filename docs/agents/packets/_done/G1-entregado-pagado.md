# Paquete G1 — "Entregado" exige pedido pagado (L5)

**Estado:** MERGEADO (#8) · sin migración
**Carril:** L5
**Origen:** auditoría 2026-09-18, roto #1
**No hagas:** Connect, transferencias, tocar el webhook, rediseñar `/admin/reservas`.

## Objetivo

`markOrderDeliveredAction` marca `orders.status = 'delivered'` sin verificar que el
pedido esté pagado. El filtro de pagado vive en la **página**
(`app/admin/reservas/page.tsx:46-47`), no en la acción — y una Server Action no se
protege con lo que muestre una lista.

Hoy el daño es un `status` sucio. Cuando el paquete E ate el payout de Connect a
"Entregado", esto transfiere dinero por un pedido que nunca se cobró. **Este
paquete es precondición de E.**

## Archivos permitidos

- `app/admin/reservas/actions.ts` — solo `markOrderDeliveredAction`
- `docs/agents/STATUS.md` — fecha / tabla

## Archivos prohibidos

`app/api/webhooks/**`, `app/[locale]/checkout/**`, `lib/settings.ts`,
`app/admin/reservas/page.tsx`, `_components/**`, migraciones, `middleware.ts`,
`package.json`.

## Qué cambia

El UPDATE debe exigir pago confirmado en la **misma consulta**, no en un `if`
previo (un `select` + `update` en dos pasos es una carrera):

```ts
await supabase
  .from('orders')
  .update({ status: 'delivered' })
  .eq('id', orderId)
  .eq('payment_status', 'completed')
  .not('status', 'in', '(delivered,cancelled)')
```

El `select` previo de `status` puede desaparecer: el filtro ya vive en el UPDATE.
`delivered` es un valor válido del CHECK de `0001_initial_schema.sql` — no se toca
el esquema.

## DoD

- [ ] Un pedido con `payment_status != 'completed'` NO se puede marcar entregado
- [ ] Un pedido `cancelled` sigue sin poder marcarse
- [ ] Repetir el clic es idempotente (no rompe, no duplica)
- [ ] La acción sigue empezando con `requireAdminSession()`
- [ ] No se llama a Stripe en ningún punto
- [ ] type-check + lint limpios
- [ ] Commit: `fix(admin): delivered requires a paid order`

## BLOQUEO explícito

Si crees que hace falta un estado nuevo (`ready_for_pickup`, `paid`, etc.): no.
Anota BLOQUEO y para. El CHECK de `orders.status` es de FROZEN.
