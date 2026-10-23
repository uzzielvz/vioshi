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
- Ventanas viven en `settings`: tarjeta ~~20~~ **30** min (corregido 2026-10-13, ver abajo) · SPEI 30 min · OXXO 24 h. Umbral solo-tarjeta: $500.
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
- Estética B/N, uppercase, tracking-wide. No introducir color de acento. *(Reemplazado 2026-10-14: ver abajo.)*

## Agregado 2026-10-13 (humano)

- Rumbo reconfirmado: **marketplace**. Viogi sigue como primera tienda. Plan y etapas en [`../PROYECTO.md`](../PROYECTO.md).
- Referencia visual: **Grailed** (capturas en `docs/design/referencias/`). No es una copia: se adopta el feed y la tipografía. Las reglas tipográficas concretas (uppercase, tracking) se fijan en la Etapa 2 con una prueba visual aprobada.
- La búsqueda visual **se queda**. No se quita en limpiezas.
- `/archive` y `/pages/chapters` se borran (contenido inventado). Los entregables escolares (TMPI, CS50) salen del repo.
- Corrección a "Dinero": la ventana de tarjeta mínima es **30 min** (piso de Stripe Checkout; ver `_done/G2`), no 20.

## Agregado 2026-10-14 (humano)

- **Color:** se levanta "sin color de acento". El acento es el **azul de Grailed** (acciones primarias, CTA de registro). Un **verde** solo para casos muy puntuales (promos, confirmaciones). Todo lo demás sigue en B/N. Valores exactos: `docs/design/TOKENS.md` (Etapa 2).
- **Tipografía:** lo más parecido a Grailed, conservando Helvetica Neue / Inter de la tienda actual. No se auto-hospedan fuentes propietarias de Grailed: se usan equivalentes libres. *(Reemplazado 2026-10-23: Inter en todo, ver abajo.)*
- **Talla:** vuelve al formulario del admin como atributo `Talla`.
- **Studio:** no se usa hoy, pero **no se borra** (código, tablas ni `studio-assets`).

## Agregado 2026-10-23 (humano)

- La plataforma se llama **rail**. Se configura con `NEXT_PUBLIC_BRAND_NAME=rail` (env), no se hardcodea. Viogi es una tienda dentro de rail.
- rail funciona como **red social**: seguir tiendas, marcas y búsquedas; feed «Para ti»; perfiles de tienda (con portada) y de persona. Seguir ya no es Fase 3.
- **Diseño aprobado:** [`../design/prototipo-rail.html`](../design/prototipo-rail.html) + [`../design/TOKENS.md`](../design/TOKENS.md). Reemplaza la dirección del 2026-10-14 («lo más parecido a Grailed»): no Kode Mono, no Oswald, no botones píldora, no etiquetas colgantes, no cinta métrica.
- La tarjeta de la feed **no** muestra medidas ni estado. Las medidas van dentro de la prenda.

## Agregado 2026-10-23, segunda parte (humano)

- **Todas las cuentas son iguales.** Cualquiera compra, guarda, sigue y puede tener seguidores. Vender son tres pasos extra: perfil de vendedor, cobros (Stripe) y revisión de rail. La revisión mantiene vigente «registro de vendedores cerrado: aprobar es un acto de admin».
- **Mensajes:** sí. **Ofertas:** diseñadas, sin implementar hasta que el humano lo decida.
- Lo social y los arreglos de compra avanzan **en paralelo**.

## Prohibido en Fase 1 de plataforma

Registro abierto · reviews · Skydropx · recolección propia · Next 16 · segundo codebase · renombrar `VIO-` · borrar seeds de ejemplo que rompan `order_items`.
