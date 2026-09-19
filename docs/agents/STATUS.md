# Estado del código

**Verificado:** 2026-09-18 · A1 + F + D en `main` · prod `vioshi.vercel.app`

> Actualiza **solo este archivo** al cerrar un paquete.

## Qué es hoy

Tienda Next.js 14 + Supabase + Stripe Checkout Sessions, con **Viogi como primera `store`**.  
Mario no es tienda: `products.owner` (`uzziel` | `mario`) es interno. Connect no está.

## Hecho (no rehacer)

| Área | Evidencia |
|---|---|
| Checkout Sessions (tarjeta / OXXO / SPEI) | `app/[locale]/checkout/actions.ts` |
| Reserva atómica | `0012`–`0014` |
| Webhook asíncrono | `app/api/webhooks/stripe/route.ts` |
| IVA no se suma ni se muestra | `tax_mxn = 0` |
| Lookup `guest_token` / `session_id` | `lib/orders.ts` |
| Pickup desde DB | `lib/pickup.ts`, `0015` |
| Envío a domicilio editable | `settings.home_shipping_mxn`, `/admin/settings`, `0017` |
| Marca por env | `lib/brand.ts` |
| Medidas, estado, `owner`, `cost_mxn` | `0010` |
| Brands | `/admin/brands` |
| Visual search + embed al publicar | `lib/embeddings.ts`, `/admin/products` |
| Marcar pedido entregado | `/admin/reservas` (sin Stripe) |
| Viogi como tienda | `0016`, `/tienda/viogi`, “Vendido por” |
| `/vender` persiste `pending` | `store_applications`, no auto-aprueba |
| Auth clientes | `app/[locale]/account/**` |

## Paquetes

| Paquete | Carril | Estado |
|---|---|---|
| A1 shipping | L1 | **MERGEADO** (#4) |
| F admin-ops | L5 | **MERGEADO** (#7) |
| D stores | L4 | **MERGEADO** (#6) |
| E Connect | L7 | **BLOQUEADO** — ver `OPEN.md` y más abajo |

No registro abierto. No reviews. No Skydropx. No Next 16. No paquete LISTO.

## Migraciones

Repo/prod: `0001`–`0017`. Siguiente libre: **`0018`**.

## Incidente 2026-09-18

No vaciar `checkout/actions.ts` ni el webhook de Stripe.

## Fuera de este OS

Vault: `C:\Users\uzzie\Documents\Obsidian Vault\70_Trabajo\Viogi`
