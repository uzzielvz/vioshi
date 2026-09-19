# Estado del código

**Verificado:** 2026-09-18 · merge #4 + #7 en curso · prod `vioshi.vercel.app`

> Actualiza **solo este archivo** al cerrar un paquete.

## Qué es hoy

Tienda Next.js 14 + Supabase + Stripe Checkout Sessions.  
Viogi es la tienda ancla. `products.owner` (`uzziel` | `mario`) es interno.

## Hecho (no rehacer)

| Área | Evidencia |
|---|---|
| Checkout Sessions (tarjeta / OXXO / SPEI) | `app/[locale]/checkout/actions.ts` |
| Reserva atómica de pieza única | `0012`–`0014` |
| Webhook asíncrono | `app/api/webhooks/stripe/route.ts` |
| IVA no se suma ni se muestra; `tax_mxn = 0` | checkout + cart |
| Lookup con `guest_token` o `session_id` | `lib/orders.ts` |
| Pickup desde DB | `lib/pickup.ts`, `0015` |
| Envío a domicilio editable | `settings.home_shipping_mxn`, `0017` |
| Marca de plataforma por env | `lib/brand.ts` |
| Medidas, estado, `owner`, `cost_mxn` | `0010`, `lib/garments.ts` |
| Brands | `0007`, `/admin/brands` |
| Visual search | `/[locale]/visual-search` |
| Auto-embed al publicar + banner pendiente | `lib/embeddings.ts`, `/admin/products` |
| Marcar pedido entregado (sin Stripe) | `/admin/reservas` |
| Auth clientes | `app/[locale]/account/**` |

## Paquetes

| Paquete | Carril | Estado |
|---|---|---|
| A1 shipping | L1 | **MERGEADO** (#4) |
| F admin-ops | L5 | **MERGEADO** (#7) |
| D stores | L4 | **EN PR** (#6) — `0016` ya en prod |
| E Connect | L7 | **BLOQUEADO** — contador + Express MX |

No registro abierto. No reviews. No Skydropx. No Next 16.

## Aún no en `main` (llega con #6)

- Código de `/tienda/[slug]`, “Vendido por”, `/vender` persistente
- En prod **sí** existen `stores`, `store_id`, `store_applications` (`0016`)

## Migraciones

Repo/prod: `0001`–`0017`. Siguiente libre: **`0018`**.

`0015` pickup real · `0016` stores (prod) · `0017` home shipping.

## Fuera de este OS

Vault: `C:\Users\uzzie\Documents\Obsidian Vault\70_Trabajo\Viogi`
