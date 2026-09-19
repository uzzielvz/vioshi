# Estado del código

**Verificado:** 2026-09-18 contra el working tree (no contra docs viejos).  
**HEAD:** `d63e56d` · repo `uzzielvz/vioshi` · local `viogi-dot-comm` · prod `vioshi.vercel.app`

> Actualiza **solo este archivo** al cerrar un paquete. Fecha + commit + una línea.

## Qué es hoy

Una **tienda** Next.js 14 (App Router) + Supabase + Stripe Checkout Sessions.  
El rumbo es un **marketplace** con Viogi como tienda ancla. Aún **no** hay tabla `stores`, ni `/tienda/[slug]`, ni Stripe Connect.

Hacia el cliente hay una sola tienda (Viogi). `products.owner` (`uzziel` | `mario`) es interno, para repartir dinero después.

## Hecho (no rehacer)

| Área | Evidencia |
|---|---|
| Checkout Sessions (tarjeta / OXXO / SPEI) | `app/[locale]/checkout/actions.ts`, `checkout/page.tsx` |
| Reserva atómica de pieza única | migraciones `0012`–`0014`, RPC de reserva |
| Webhook asíncrono (paga después) | `app/api/webhooks/stripe/route.ts` |
| IVA no se suma ni se muestra; `tax_mxn = 0` | checkout + cart |
| Lookup de pedido exige `guest_token` o `session_id` verificado | `lib/orders.ts` |
| Pickup desde DB, agrupado por municipio, fecha por `transfer_day` | `lib/pickup.ts`, `0015`, checkout |
| Marca de plataforma por env | `lib/brand.ts` + `NEXT_PUBLIC_BRAND_*` |
| Medidas, estado 3 niveles, `owner`, `cost_mxn` | `0010`, `lib/garments.ts`, admin products |
| Brands como entidad | `0007`, `/admin/brands` |
| Visual search Gemini + pgvector | `/[locale]/visual-search`, `/api/visual-search` |
| Admin: productos, reservas, settings, studio, pickup | `app/admin/**` |
| Auth clientes (email + Google) | `app/[locale]/account/**` |
| Auto-embed al publicar prenda + marcar pedido entregado | `lib/embeddings.ts`, `app/admin/products/actions.ts`, `app/admin/reservas/actions.ts` |

## Siguiente código (paquetes)

| Prioridad | Paquete | Carril | Estado |
|---|---|---|---|
| 1 | [`packets/D-stores.md`](./packets/D-stores.md) | L4 | **LISTO** — primer código de marketplace |
| 2 | [`packets/F-admin-ops.md`](./packets/F-admin-ops.md) | L5 | **PR abierto** — auto-embed + marcar entregado |
| 3 | [`packets/A1-shipping.md`](./packets/A1-shipping.md) | L1 | **LISTO** — envío a domicilio editable; no inventar el precio |
| 4 | [`packets/E-connect.md`](./packets/E-connect.md) | L7 | **BLOQUEADO** — negocio + Stripe MX |

No abrir registro público de vendedores. No reviews. No Skydropx. No Next 16.

## Hoy no existe (comprobado con grep)

- `stores`, `store_id`, `store_applications`
- `app/[locale]/tienda/`
- Connect / `application_fee` / `stripe_account_id`
- Persistencia de `/vender` (el form hace `setTimeout` y finge éxito)
- Auto-embedding al publicar (sigue siendo `scripts/generate-embeddings.ts`)

## Incidente 2026-09-18

`checkout/actions.ts` y `api/webhooks/stripe/route.ts` aparecieron **vacíos** en el working tree (−807 líneas). Se restauraron desde HEAD. Si un agente barato “limpia” esos archivos, el cobro muere. **No vaciar archivos de L1.**

## Migraciones

Repo: `0001` … `0015`. Siguiente número libre: **`0016`** (asignado a L4; no lo uses para otra cosa).

Prod (`oilvubxpxxzfxlqhsumk`, 2026-09-18): `0001`–`0015` aplicadas. `0015` sembró 13 puntos activos (Rectoría dropoff + red) y apagó los 8 ficticios. Almoloya y Tianguistenco siguen inactivos (datos huecos).

Schema escrito hasta `0011`: `docs/ESQUEMA-REAL.md`.

## Fuera de este OS

Vault: `C:\Users\uzzie\Documents\Obsidian Vault\70_Trabajo\Viogi`  
Playbook paralelo: `Divide and Conquer.md` en la raíz del vault.
