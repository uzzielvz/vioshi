# Carriles

**Un agente = un carril = archivos que nadie más toca en esa sesión.**  
Si dos agentes necesitan el mismo archivo, van **en serie**.

## Mapa

| Carril | Estado | Toca solo | No toca |
|---|---|---|---|
| **L1 Dinero** | Casi cerrado | `app/[locale]/checkout/**`, `lib/orders.ts`, `lib/constants.ts`, `lib/settings.ts`, `store/cartStore.tsx`, `app/api/webhooks/stripe/**`, `lib/stripe.ts` | admin products, visual-search, studio, tienda |
| **L2 Pickup** | Cerrado | `lib/pickup.ts`, `app/admin/pickup-points/**`, `0015_*` | lógica de cobro Stripe |
| **L3 Marca** | Cerrado | `lib/brand.ts`, metadata / OG | checkout, migraciones |
| **L4 Stores** | **Siguiente** | `0016_stores*`, `app/[locale]/tienda/**`, `app/[locale]/vender/**` (persistir), `lib/products.ts` (solo `store_id` + join), `ProductContent` etiqueta | webhooks Stripe, Connect |
| **L5 Admin catálogo** | Abierto | `app/admin/products/**`, embeddings al publicar | checkout, Connect |
| **L6 Visual** | Mantenimiento | `app/api/visual-search/**`, `app/[locale]/visual-search/**`, `visual-search/**` | checkout |
| **L7 Connect** | Bloqueado | onboarding Express, transfer al entregar, `stripe_account_id` | no empezar hasta `STATUS` lo desbloquee |
| **L8 Studio** | Aislado | `app/admin/studio/**`, `lib/studio/**`, `0008`/`0009` | checkout, stores, Connect |

## Integración (orden)

```
L4 stores          ← único carril de marketplace ahora
L5 admin-ops       ← paralelo a L4 (archivos distintos)
L1 A1 shipping     ← serie si toca checkout; si solo settings + constants, ok paralelo a L4
L7 Connect         ← después de L4 y del desbloqueo humano
```

L2 y L3 no se relanzan. Si pickup o brand se rompen, es un hotfix en serie, no un agente paralelo.

## Worktrees (recomendado)

```bash
git worktree add ../viogi-L4 -b agent/L4-stores
git worktree add ../viogi-L5 -b agent/L5-admin-ops
```

Merge a `main` solo con `npm run type-check` y `npm run lint` limpios.

## Anti-choques

| Síntoma | Causa | Fix |
|---|---|---|
| Dos agentes en `checkout/page.tsx` | L1 + L2/L4 mal cortados | L4 no edita checkout. L1 no edita `tienda/` |
| Dos migraciones `0016` | Sin número asignado | El paquete ya fija `0016` para stores |
| `lib/products.ts` en conflicto | L4 y L5 a la vez | Serie: primero L4 (`store_id`), luego L5 |
| Agente “actualiza PLAN.md” | Docs hidra | Solo `docs/agents/STATUS.md` |
| Archivos L1 vaciados | Agente “simplificó” | Restaurar de git. Nunca vaciar L1 |
