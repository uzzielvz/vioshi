# Estado del código

**Verificado:** 2026-09-18 contra el working tree (no contra docs viejos). Paquete D en PR.  
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

## Siguiente código (paquetes)

| Prioridad | Paquete | Carril | Estado |
|---|---|---|---|
| 1 | [`packets/D-stores.md`](./packets/D-stores.md) | L4 | **EN PR** (`#6`) — `0016` ya está en prod |
| 2 | [`packets/F-admin-ops.md`](./packets/F-admin-ops.md) | L5 | **LISTO** — auto-embed + marcar entregado |
| 3 | [`packets/A1-shipping.md`](./packets/A1-shipping.md) | L1 | **LISTO** — envío a domicilio editable; no inventar el precio |
| 4 | [`packets/E-connect.md`](./packets/E-connect.md) | L7 | **BLOQUEADO** — negocio + Stripe MX |

No abrir registro público de vendedores. No reviews. No Skydropx. No Next 16.

## Hoy no existe (comprobado con grep)

- Connect / `application_fee` (la columna `stripe_account_id` ya existe en `stores`, sin uso)
- Auto-embedding al publicar (sigue siendo `scripts/generate-embeddings.ts`)

`stores` / `store_id` / `store_applications` ya existen en prod (`0016`).
El código de `/tienda` y `/vender` llega al mergear `#6`.

## Incidente 2026-09-18

`checkout/actions.ts` y `api/webhooks/stripe/route.ts` aparecieron **vacíos** en el working tree (−807 líneas). Se restauraron desde HEAD. Si un agente barato “limpia” esos archivos, el cobro muere. **No vaciar archivos de L1.**

## Migraciones

Repo: `0001` … `0017` (`0016` en este PR, `0017` ya en `main`).
Siguiente número libre: **`0018`**.

Prod (`oilvubxpxxzfxlqhsumk`, 2026-09-18): `0001`–`0017` aplicadas.
`0015` sembró 13 puntos activos. `0016` sembró `viogi` y backfilleo `store_id`.
`0017` es `home_shipping_mxn` (semilla $10). Almoloya y Tianguistenco siguen inactivos.

Schema escrito hasta `0011`: `docs/ESQUEMA-REAL.md`.

## Fuera de este OS

Vault: `C:\Users\uzzie\Documents\Obsidian Vault\70_Trabajo\Viogi`  
Playbook paralelo: `Divide and Conquer.md` en la raíz del vault.
