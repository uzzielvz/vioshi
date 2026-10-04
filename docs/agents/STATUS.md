# Estado del código

**Verificado:** 2026-09-18 · A1 + F + D en `main` · prod `vioshi.vercel.app`

> Actualiza **solo este archivo** al cerrar un paquete. Es el único doc que describe estado:
> si otro archivo cuenta qué se mergeó, en dos semanas se contradicen.
> Histórico de sesiones: `sessions.md` en la raíz.

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
| Marcar pedido entregado | `/admin/reservas` (sin Stripe). **Exige `payment_status = 'completed'`** (#8) |
| Viogi como tienda | `0016`, `/tienda/viogi`, “Vendido por” |
| `/vender` persiste `pending` | `store_applications`, no auto-aprueba |
| Auth clientes | `app/[locale]/account/**` |

## Paquetes

| Paquete | Carril | Estado |
|---|---|---|
| A1 shipping | L1 | **MERGEADO** (#4) |
| F admin-ops | L5 | **MERGEADO** (#7) |
| D stores | L4 | **MERGEADO** (#6) |
| G1 entregado-pagado | L5 | **MERGEADO** (#8) |
| G2 settings-limpieza | L1 | **MERGEADO** (#9) |
| E Connect | L7 | **BLOQUEADO** — ver `OPEN.md` y más abajo |

**No hay paquete abierto.** El único que queda es E, y es humano, no código.

Worktrees libres: `../viogi-L1` (`agent/L1-settings`) y `../viogi-L5` (`agent/L5-entregado`),
con `npm ci` hecho. El siguiente agente hace `git fetch` + `checkout -B <rama> origin/main`.

No registro abierto. No reviews. No Skydropx. No Next 16.

## Dónde se opera (sin desplegar código)

| Qué | Dónde |
|---|---|
| Precio de envío a domicilio | `/admin/settings` → "Envío a domicilio (MXN)". Semilla $10 |
| Costo por punto de entrega | `/admin/pickup-points` (por fila, no el setting de domicilio) |
| Ventanas de reserva y umbral solo-tarjeta | `/admin/settings` |
| Tienda Viogi | `/es/tienda/viogi` · "Vendido por Viogi" en cada ficha |
| Solicitudes de vendedor | `/es/vender` → fila `pending` en `store_applications`. **No se aprueba sola** |
| Embedding al publicar | crear/editar en `/admin/products`. Si Gemini falla: banner "Embedding pendiente" |
| Marcar entregado | `/admin/reservas` → "Pedidos por entregar" |

Marcar entregado **no** transfiere dinero. Eso es el paquete E.

## Migraciones

Repo/prod: `0001`–`0017`. Siguiente libre: **`0018`**.

## Auditoría 2026-09-18

`main` @ `634cecb` auditado contra código y contra prod. Cobro intacto, A1/D/F vivos,
grants correctos (`owner` y `stripe_account_id` dan 401 a anon), 28/28 prendas con
`store_id`, `settings.home_shipping_mxn = 10`. Sin P0. Los dos rotos encontrados son
G1 y G2. Nits no urgentes: prompt de Gemini duplicado en `scripts/generate-embeddings.ts`
vs `lib/embeddings.ts` (canon = `lib/`), `?embed=pending` en productos sin imagen.

## Incidente 2026-09-18

No vaciar `checkout/actions.ts` ni el webhook de Stripe.

## Fuera de este OS

Vault: `C:\Users\uzzie\Documents\Obsidian Vault\70_Trabajo\Viogi`
