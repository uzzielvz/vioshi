# Decisiones congeladas (código)

Un agente **no debate** esto. Si el humano cambia una, se agrega una línea nueva aquí — no se reescribe la historia.

Fuente de los porqués: Obsidian `Decisiones.md` + `Plataforma_MVP.md`.

## Producto

- Un solo repo. No se construye un segundo sitio.
- La web es la **plataforma**. Viogi es la **primera tienda** dentro.
- Nombre de plataforma: variable de entorno (`lib/brand.ts`). Default provisional `VIOGI`. No hardcodear un nombre nuevo.
- Copy de tienda (“Vendido por Viogi”, `/tienda/viogi`, Instagram de la tienda) ≠ nombre de plataforma.
- Prefijo de pedido `VIO-` no se toca.
- Mario **no** es tienda propia. Va dentro de Viogi. `owner` (`uzziel` \| `mario`) reparte capital. El piloto multi-tienda público empieza con el primer vendedor **externo**.
- Registro de vendedores: **cerrado**. `/vender` = solicitud. Aprobar es un acto de admin.

## Dinero

- Titular Stripe / dominio / deploy: **Uzziel**.
- Pasarela: **Stripe Checkout Sessions**. No Payment Element. No Mercado Pago.
- Comisión de plataforma al inicio: **0 %**. Connect (cuando exista) solo reparte por `owner`. Comisión 8–10 % es objetivo **futuro**, no se implementa ahora.
- `price_mxn` es precio final. **No sumar IVA. No mostrar línea de IVA. `tax_mxn = 0`.**
- Autoridad de reserva: **nuestra DB** (`reserved_until` / RPC de stock), no las ventanas de Stripe.
- Ventanas viven en `settings`: tarjeta 20 min · SPEI 30 min · OXXO 24 h. Umbral solo-tarjeta: $500.
- Pickup: costo **por fila** en `pickup_points.additional_cost_mxn`. No tarifa global fija.
- Valores semilla de pickup ($10 hub / $20 red) son editables. No reescribirlos en código.
- Pieza única: una prenda = una unidad. `sold_out` + reserva atómica. No revivir `product_variants` para stock.

## Datos

- `owner` y `cost_mxn` son **internos**. Nunca `select('*')` en `lib/products.ts` ni en el cliente.
- Talla: atributo `Talla` en `product_attributes`, no `product_variants`.
- Medidas en cm, prenda en plano. Estado: `impecable` · `buen_estado` · `con_detalles`.
- Columna nueva en `products`: nace invisible a `anon` hasta un `GRANT` explícito (`0011`).
- Número de migración: lo pone el humano en el prompt. Nunca dos agentes eligen el mismo.

## Stack (no “mejorar” de paso)

- Next.js 14 App Router. TypeScript strict. Tailwind. next-intl (`localePrefix: 'always'`).
- Supabase directo, sin Prisma/Drizzle.
- `"use client"` solo si hace falta. Mutaciones = Server Actions, salvo webhooks / APIs públicas.
- Contenido de producto en español. Código y comentarios en inglés.
- Alias `@/`. `clsx` para clases condicionales.
- Estética B/N, uppercase, tracking-wide. No introducir color de acento.

## Prohibido en Fase 1 de plataforma

Registro abierto · reviews · Skydropx · recolección propia · Next 16 · segundo codebase · renombrar `VIO-` · borrar seeds de ejemplo que rompan `order_items`.
