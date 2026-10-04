# Paquete A1 — Envío a domicilio editable (L1)

**Estado:** MERGEADO (#4) · el **monto real** sigue abierto en negocio  
**Carril:** L1  
**No hagas:** Skydropx, tarifario por CP, inventar $150 ni ningún “precio correcto”.

## Objetivo

`$10` en `STANDARD_SHIPPING_COST` es plantilla. El checkout de domicilio debe leer un valor **editable** (tabla `settings` + `/admin/settings`), igual que las ventanas de reserva.

Pickup **ya** sale de `pickup_points.additional_cost_mxn`. No lo reescribas.

## Archivos permitidos

- `lib/settings.ts` — añadir `home_shipping_mxn`
- `lib/constants.ts` — `STANDARD_SHIPPING_COST` deja de ser la fuente del checkout (puede quedar como fallback)
- `app/admin/settings/**`
- `supabase/migrations/0017_home_shipping.sql` **solo si L4 ya usó 0016**. Si 0016 no está mergeada, el humano te da el número. **No uses 0016.**
- `app/[locale]/checkout/actions.ts` — leer setting para domicilio; no cambiar Sessions / reserva / IVA
- `app/[locale]/checkout/page.tsx` — mostrar el monto leído, no el hardcode
- `docs/agents/STATUS.md`

## Archivos prohibidos

Webhooks (salvo que hoy calculen envío — entonces un toque mínimo y documentado), `tienda/**`, studio, visual-search, `middleware.ts`, `package.json`.

## Valor semilla

Default = `10` (lo que hay hoy). El humano lo cambia en admin cuando Maneki/Skydropx existan.  
`EXPRESS_SHIPPING_COST` no es un producto real: no lo promociones; si no se usa en UI, no lo expandas.

## DoD

- [ ] Domicilio usa `settings.home_shipping_mxn`
- [ ] Admin puede cambiarlo sin deploy
- [ ] Pickup sigue por fila de DB
- [ ] IVA sigue en 0 / no se muestra
- [ ] type-check + lint
- [ ] Commit: `fix(checkout): home shipping from settings`

## BLOQUEO explícito

No preguntes “¿cuánto debe costar?” al código. Si el humano no lo dijo, $10 semilla + setting.
