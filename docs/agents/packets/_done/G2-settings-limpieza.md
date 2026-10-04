# Paquete G2 — Quitar el andamio de `home_shipping_mxn` (L1)

**Estado:** MERGEADO (#9) · sin migración
**Carril:** L1
**Origen:** auditoría 2026-09-18, roto #2
**No hagas:** tocar `checkout/actions.ts`, el webhook, el cálculo de totales, IVA,
reserva, ni el valor semilla ($10 lo cambia el humano en admin).

## Objetivo

A1 se escribió cuando `0017` todavía no tenía número asignado, así que tres
archivos consultan `settings` **dos veces** y esconden el campo de envío tras un
flag `home_shipping_available`.

`0017` ya está en repo **y en prod** (verificado: `settings.home_shipping_mxn = 10.00`).
El andamio sobra y tiene un efecto real: si ese `select` falla por cualquier motivo
transitorio, `/admin/settings` deja de guardar el precio de envío **en silencio** —
sin error, simplemente omitiendo la columna del UPDATE.

## Archivos permitidos

- `lib/settings.ts`
- `app/admin/settings/page.tsx`
- `app/admin/settings/actions.ts`
- `app/admin/settings/_components/SettingsForm.tsx`
- `docs/agents/STATUS.md` — fecha / tabla

## Archivos prohibidos

`app/[locale]/checkout/**`, `app/api/webhooks/**`, `lib/constants.ts`,
`lib/stripe.ts`, `store/cartStore.tsx`, migraciones, `middleware.ts`, `package.json`.

## Qué cambia

1. **`lib/settings.ts`** — un solo `select` con `home_shipping_mxn` incluido.
   Borrar el segundo query de respaldo (`:50-52`) y el comentario que habla de
   "BLOQUEO en STATUS.md / falta número de migración" (`:14-17`). Si el query
   falla, se usa `FALLBACK` como cualquier otro setting.

2. **`app/admin/settings/page.tsx`** — un solo `select`; `BASE_COLUMNS` incluye
   `home_shipping_mxn`. Fuera `homeShippingAvailable` y el comentario `:14-17`.

3. **`app/admin/settings/actions.ts`** — fuera el gate
   `home_shipping_available === '1'` (`:26-29`). El envío se valida y se guarda
   siempre, con la misma regla: número finito ≥ 0.

4. **`SettingsForm.tsx`** — fuera la prop `homeShippingAvailable`, el
   `<input type="hidden" name="home_shipping_available">` (`:85`) y la rama
   "Pendiente migración — no editable todavía" (`:137-150`). Queda solo el `Campo`
   de "Envío a domicilio (MXN)".

Aprovecha para corregir `FALLBACK.card_reserve_minutes`: dice `20` con el
comentario "iguales a los DEFAULT de 0012", pero el admin exige ≥ 30 (piso de
Stripe) y prod tiene 30. Ponlo en `30` y ajusta el comentario. Nada más de ese
archivo.

## DoD

- [ ] `/admin/settings` muestra y **guarda** "Envío a domicilio (MXN)" siempre
- [ ] Una sola consulta a `settings` por lectura (no dos)
- [ ] Ningún comentario menciona una migración pendiente
- [ ] El checkout sigue leyendo `settings.home_shipping_mxn` (no se toca ese archivo)
- [ ] Pickup sigue saliendo de `pickup_points.additional_cost_mxn`
- [ ] type-check + lint limpios
- [ ] Commit: `refactor(settings): drop home shipping migration scaffolding`

## BLOQUEO explícito

No decidas cuánto "debería" costar el envío. $10 es semilla editable, y el monto
real es una fila ⏳ de `OPEN.md`.
