# PROYECTO — contexto, destino y hoja de ruta

> **Primera lectura de cualquier agente o persona nueva.** Explica qué es este repo, a dónde va,
> cómo está organizado y en qué orden se trabaja. Escrito el 2026-10-13 a partir de una lectura
> completa del código (storefront, checkout, admin, datos, plataforma y docs).
>
> Este archivo guarda **rumbo y plan**, no estado. Lo que ya está hecho vive en
> [`agents/STATUS.md`](./agents/STATUS.md). Si este archivo y el código discrepan, **gana el código**.
> Si este archivo y [`agents/FROZEN.md`](./agents/FROZEN.md) discrepan, gana FROZEN.

---

## 1. Qué es

Un **ecommerce de moda de segunda mano (streetwear y diseñador)** hecho en Next.js 14 + Supabase +
Stripe, en producción en `vioshi.vercel.app`.

Hoy opera **una sola tienda: Viogi**. Es el negocio real de Uzziel, que antes vendía solo por
Instagram ([@viogi_](https://www.instagram.com/viogi_/)). Mario (socio) vende piezas **dentro** de
Viogi. Su parte se separa con `products.owner` (`uzziel` | `mario`), no es una tienda aparte.

Cada prenda es **pieza única**: una prenda = una unidad, con reserva atómica en la base de datos
mientras alguien la paga.

## 2. Destino

**Un marketplace de moda de segunda mano para México, con la experiencia de Grailed.** La
plataforma es la web; las tiendas viven dentro, y Viogi es la primera.

Esto ya estaba congelado (FROZEN: "la web es la plataforma, Viogi es la primera tienda") y el
humano lo reconfirmó el 2026-10-13. No se construye un segundo sitio ni un segundo codebase.

Se llega por **puertas de producto**, no por fechas. El detalle está en [`agents/OPEN.md`](./agents/OPEN.md) § Puertas.

| Fase | Qué es | Puerta para pasar a la siguiente |
|---|---|---|
| **1 · Piloto** (ahora) | Una tienda visible (Viogi), Mario dentro, comisión 0 % | ≥ 40 % de ventas por web, ≥ 20 pedidos, Mario aceptaría el 8 % |
| **2 · Tiendas invitadas** | 3 tiendas externas. El registro de vendedores sigue siendo por aprobación del admin | La decide el humano |
| **3 · Abierto** | Registro abierto, reviews, comisión automática 8–10 %, Skydropx | — |

**Regla:** un agente no adelanta una fase porque el código sea fácil. Lo prohibido en Fase 1 está en
FROZEN § "Prohibido en Fase 1".

### Cómo se ve el destino (referencia Grailed)

Capturas en [`design/referencias/`](./design/referencias/). **No es una copia.** Se toma el
lenguaje visual (sobre todo el **feed** y la **tipografía**) y se adaptan los flujos.

| Captura | Qué enseña | Cuándo aplica |
|---|---|---|
| `02-feed.png` | Feed a 2 columnas de borde a borde con foto grande. Debajo: marca + categoría (truncada) y talla; luego precio y corazón. Saludo personalizado y secciones tipo "Daily Picks For You" | **Fase 1.** Es el rediseño de home, colecciones y búsqueda |
| `05-registro.png` | Modal de registro: logo, propuesta de valor, botones píldora, login social | **Fase 1.** Cuenta de cliente (ya existe, falta el diseño) |
| `03-sell-dashboard.png` | Panel de vendedor: pestañas Home / Ofertas / En venta / Vendido / Borradores, avisos, botón fijo "Agregar" | **Fase 2.** Panel de vendedor. Antes sirve de guía para el admin móvil de Mario |
| `04-onboarding-preferencia.png` | Elegir hombre / mujer / ambos al entrar | **Fase 2–3.** Necesita un atributo de departamento que hoy no existe |
| `01-follows.png` | Seguir diseñadores, vendedores, búsquedas y colecciones | **Fase 3.** Necesita cuentas, tabla de follows y feed personalizado |

---

## 3. Stack y reglas que no se discuten

Stack: Next.js 14 App Router · TypeScript strict · Tailwind · next-intl (`es`/`en`,
`localePrefix: 'always'`) · Supabase (Postgres + Auth + Storage + pgvector) directo, sin ORM ·
Stripe **Checkout Sessions embebido** (`ui_mode: 'embedded_page'` + `EmbeddedCheckout`) ·
Gemini (`@google/genai`) para búsqueda visual y Studio.

Las decisiones congeladas completas están en [`agents/FROZEN.md`](./agents/FROZEN.md). Las que más se rompen:

- **Dinero.** IVA incluido: `tax_mxn = 0`, no se suma ni se muestra. Precio y totales se calculan
  siempre en el servidor con el precio de la DB. La autoridad de reserva es la DB
  (`reserve_products` / `mark_order_sold`), no Stripe. Una prenda de pedido web solo la marca
  vendida el webhook. Una venta presencial la marca el admin a mano (`toggleSoldAction`). El prefijo de pedido `VIO-` no se toca.
- **Datos.** El catálogo público nunca usa `select('*')` ni expone `owner`, `cost_mxn`,
  `reserved_order_id`, `reserved_at`, `reservation_kind`, `reserved_contact_*` ni
  `stripe_account_id`. `reserved_until` sí es público a propósito (`0012`): con él se muestra
  la prenda como «apartada». Toda columna nueva de `products` nace invisible a `anon`
  hasta un `GRANT` explícito. Si se te olvida, el catálogo sale **vacío sin error**.
- **Marca.** El nombre de plataforma sale de `lib/brand.ts` (`NEXT_PUBLIC_BRAND_*`, default
  provisional `VIOGI`). "Viogi" la tienda es una fila de `stores`. No se mezclan.
- **Migraciones.** Una migración = un número, y lo asigna el humano. La siguiente libre está en STATUS.
- **Código.** Código y comentarios en inglés. Copy de producto en español, vía `messages/*.json`
  (es + en). `"use client"` solo si hace falta. Mutaciones con Server Actions. Alias `@/`.
- **Visual search se queda.** Es parte del ecommerce, no se quita en la limpieza.

---

## 4. Cómo está organizado el código

Next.js plano, sin monorepo.

| Ruta | Qué es | Nota para agentes |
|---|---|---|
| `app/[locale]/` | Tienda pública con i18n | El shell (`ClientLayout`) pone Header, Footer y `pt-16`, salvo en `/account` (ninguno de los tres) y en `/checkout` (sin Footer). Fuera de eso, una página no repite ninguno |
| `app/[locale]/checkout/` | Checkout + `return` + `success` | **Carril de dinero.** Nunca vaciar `actions.ts` |
| `app/[locale]/account/` | Cuenta de cliente (Supabase Auth: email + Google) | No hay layout de cuenta: cada página valida sesión por su cuenta, salvo `/account/archivos` (mock sin sesión) |
| `app/[locale]/tienda/[slug]`, `vender/` | Semilla de marketplace: perfil de tienda y solicitud de vendedor | `/vender` solo inserta `pending`; nada lo aprueba todavía |
| `app/admin/` | Panel interno, fuera de i18n | Login con correo y contraseña por persona (`UZZIEL_ADMIN_*` / `MARIO_ADMIN_*`). `ADMIN_SECRET` solo **firma** la cookie y el `guest_token` |
| `app/api/webhooks/stripe/` | Único lugar que confirma un pedido pagado (`mark_order_sold`). También se libera una reserva en `cancelCheckoutAction`, en el rollback del checkout y a mano en `/admin/reservas` | Necesita body crudo y runtime nodejs |
| `app/api/visual-search/` | Foto → descripción Gemini → embedding 768 → pgvector | El prompt canónico es `lib/embeddings.ts`, pero la ruta no lo importa y usa un prompt propio distinto (Etapa 1) |
| `app/api/admin/studio/` | Generación de fotos de catálogo con Gemini Image | Solo Uzziel |
| `lib/products.ts`, `lib/stores.ts` | Lecturas **públicas** (anon, caché 60 s; tag `products` y tag `stores`) | Lista blanca de columnas |
| `lib/admin/*` | Sesión admin, inventario y estadísticas | Lee columnas internas con service role. **Nunca** importarlo desde `app/[locale]` |
| `lib/supabase/admin.ts` | Cliente service role | Solo servidor |
| `store/cartStore.tsx` | Carrito (Context + localStorage `viogi_cart`) | El cliente no decide precios |
| `supabase/migrations/` | Esquema versionado `0001`… | No se puede reconstruir desde cero (ver Etapa 1) |
| `messages/` | Diccionarios es/en | Mismo conjunto de claves en los dos |
| `docs/agents/` | Sistema de trabajo para agentes | Ver § 7 |
| `docs/design/referencias/` | Capturas de la GUI objetivo | Ver § 2 |
| `studio-assets/` | Referencias de estilo que Studio adjunta al prompt | **No es basura**; lo usa `lib/studio/catalogRefs.ts` |

### Cómo fluye una compra

1. **Carrito** en localStorage. No valida nada.
2. **Checkout** → `createCheckoutSessionAction`: reconcilia el carrito contra la DB, calcula totales
   en el servidor, inserta `address`, `order` y `order_items`, toma la reserva atómica
   (`reserve_products`) y crea la Checkout Session embebida.
3. **Stripe** cobra con tarjeta, OXXO o SPEI. Arriba del umbral (`settings`, $500) solo acepta tarjeta.
4. **Webhook**:
   - pagado → `mark_order_sold` → `processing` / `completed`;
   - voucher pendiente → extiende la reserva → `awaiting_payment`;
   - expirado o fallido → libera la reserva → `cancelled`.
5. **Return → success.** Vacía el carrito.
6. **Entregado.** Lo marca el admin a mano en `/admin/reservas`, y solo si `payment_status = 'completed'`.

Nadie escribe `shipped` ni `tracking_number`, y la app **no manda correos de pedido**. Los únicos
correos que salen son los de Supabase Auth (confirmar cuenta y restablecer contraseña).

---

## 5. Diagnóstico: por qué se siente desordenado

Resumen de la lectura del 2026-10-13. Los detalles con archivo y línea alimentan las etapas del § 6.

1. **Documentación hidra.** Hay 7 puntos de entrada con órdenes de lectura distintos y 5 lápidas
   en la raíz. `README.md` es el ensayo de CS50: dice Payment Element, Resend y migraciones
   0001–0006, y nada de eso es cierto. `ESQUEMA-REAL.md` llega a 0011 cuando prod va en 0023.
   `STATUS.md` no registra `/admin/reportes` ni `/admin/fondos`. El paquete H está mergeado pero
   sigue en `packets/`. FROZEN decía "tarjeta 20 min" cuando el código exige ≥ 30 (corregido el 2026-10-13).
2. **Contenido falso en la tienda.**
   - `/archive` (imágenes de Unsplash) y `/pages/chapters` (texto) son inventados.
   - `/pages/locaciones` trae direcciones ficticias y no lee `pickup_points`.
   - Envíos, pagos y devoluciones prometen $99/$199, PayPal, MSI y "productos con etiqueta".
     El código cobra el envío estándar desde `settings.home_shipping_mxn` (semilla $10, editable),
     el express a $20 fijo en `lib/constants.ts` y el pickup según el punto, con tarjeta, OXXO o SPEI.
   - El WhatsApp de soporte es `+52 55 0000 0000`.
   - `/account/archivos` muestra facturas simuladas y no pide sesión.
3. **No hay sistema de diseño.**
   - Estilos inline en la tienda: ~130 `fontFamily` repetidos, ~400 `style={}` y ~265
     `fontSize: '11px'`. Con el admin suben a ~160, ~690 y ~370.
   - `Header.tsx` mide 1284 líneas y `checkout/page.tsx` 1051.
   - La lista de categorías está copiada en 6 sitios de la tienda (Header ×2, filtros, colecciones,
     ficha, `lib/constants.ts`). La tabla `categories` solo la lee el admin y el join de `slug`;
     la tienda nunca usa sus `name_es`/`name_en`.
   - `components/common/*` tiene cero imports y `clsx` no se usa.
   - Las fuentes se cargan con `@import` que bloquea el render.
   - Hay Header y Footer duplicados en `/cart` y `/checkout`, y `pt-16` repetido.
4. **Funciones a medias.**
   - La wishlist no tiene botón que la alimente.
   - Dos de las tres entradas a búsqueda visual en el Header no hacen nada.
   - Desde el commit `088a2e3` el admin ya no captura talla ni descripción, y la ficha depende de la talla.
   - La libreta de direcciones existe pero el checkout no la usa.
   - Studio no se enlaza con el inventario: `/admin/products` no lleva a Studio, y el "New piece"
     de Studio crea productos sin SKU, tipo de prenda ni campos de negocio.
5. **Bugs de dinero y seguridad** (lo más urgente; ver Etapa 1).
6. **El marketplace solo existe en la base de datos.** Ya hay `stores`, `products.store_id`,
   `store_applications` y `stripe_account_id`. Falta la identidad de vendedor, la aprobación de
   solicitudes, el panel de vendedor, `store_id` en los pedidos y Connect.
7. **Basura en el repo.**
   - Entregables escolares: `documento-secciones-tmpi.html`, `visual-search/*.tex` y `*.docx`.
   - `.playwright-mcp/`.
   - `public/products/*.png`: 3.1 MB sin referencias.
   - `.claude/settings.local.json` está trackeado aunque `.gitignore` lo excluye.
   - Un workflow "AI Code Review" que nunca falla y usa `tj-actions/changed-files@v44` sin pin.

---

## 6. Hoja de ruta

En orden. Cada etapa se corta en **paquetes** (`docs/agents/packets/`) antes de codificar. Un
paquete = un PR. Lo marcado **(humano)** necesita una respuesta antes de empezar; ver § 8.

### Etapa 0 — Orden, sin cambiar el producto

Objetivo: que el repo diga la verdad y no tenga ruido.

- **Archivos.**
  - Borrar `app/[locale]/archive/**` y `app/[locale]/pages/chapters/` con sus links en el Header,
    las claves `archive.*` y el `remotePattern` de Unsplash en `next.config.js` (solo existe para eso).
  - Sacar del repo los entregables escolares. Quedan en el historial de git.
  - Borrar `.playwright-mcp/` y agregarlo a `.gitignore`.
  - `git rm --cached .claude/settings.local.json`.
  - `public/products/*.png` **(humano)**.
- **Docs.**
  - Un solo punto de entrada: este archivo → `docs/agents/README.md`.
  - Borrar las lápidas de la raíz: `PLAN`, `CONTEXT`, `RESEARCH-CONSOLIDADO`, `TESTING-PLAN`,
    `AUDITORIA-PRE-LANZAMIENTO`. Sus cuerpos ya están en `docs/archive/`.
  - `README.md` técnico que absorba `DEV-README.md`. El ensayo CS50 pasa a `docs/archive/`.
  - Fusionar `lanes.md` + `GIT.md` sin columnas de estado.
  - Poner al día `STATUS.md` (reportes, fondos, PR #13 y #14) y `MAP.md`, o borrar `MAP.md` en
    favor del § 4.
  - Mover el paquete H a `_done/`.
  - Archivar `ESQUEMA-REAL.md`; sus pendientes pasan a la Etapa 1.
  - Corregir en `.env.example` los eventos del webhook. Los correctos son `checkout.session.completed`,
    `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`,
    `checkout.session.expired`, `payment_intent.payment_failed` y
    `customer_cash_balance_transaction.created`.
  - Quitar el estado viejo de `.cursor/rules/10-lanes.mdc`.
  - Reescribir o borrar `.claude/commands/write-tests.md` (habla de Jest, que no existe).
- **Código muerto** (sin cambiar comportamiento).
  - Archivos: `types/product.ts`, `types/user.ts`, `types/order.ts` (quitar también sus
    `export *` de `types/index.ts`), `lib/supabase/client.ts`,
    `StyleRefsManager.tsx`, `/account/archivos`, `app/api/dev/` y `scripts/seed-real-images.ts`
    (roto con el esquema actual).
  - Exports: los muertos de `lib/constants.ts` (todos menos `STORAGE_KEYS`,
    `STANDARD_SHIPPING_COST` y `EXPRESS_SHIPPING_COST`; `DELIVERY_METHODS` solo tiene un import
    sin uso), `formatStripeClientError` (con su import sin uso en `checkout/page.tsx`) y el Proxy `stripe`.
  - Studio: **no se borra** (decidido 2026-10-14). Solo se elimina `StyleRefsManager.tsx`, que ya no se importa en ningún lado.
  - `saveAttributes` **no** se borra: lo usa la talla (Etapa 1).
  - `components/common/*` **no** se borra: se rehace en la Etapa 2.

### Etapa 1 — Dinero y seguridad (antes de más tráfico)

Cada punto lleva evidencia en la lectura del 2026-10-13. Verifica contra el código antes de corregir.

- **Cobro múltiple de una pieza única.** El carrito permite `quantity > 1`. El servidor cobra
  `price × quantity` pero reserva una sola fila. Hay que forzar cantidad 1 en el cliente **y** en
  el servidor.
- **Método de pago mal grabado.** `kindFromSession` lee `session.payment_method_types`, que es la
  lista de métodos permitidos, no el que se usó. Una tarjeta puede quedar como `oxxo` y SPEI recibe
  la ventana equivocada. Los fixtures de `scripts/test-checkout-flow.mjs` lo esconden.
- **`payment_intent.payment_failed` libera la prenda** al primer rechazo, aunque el cliente todavía
  pueda reintentar en la misma sesión.
- **Webhook con guardas incompletas.** `liberarPedido` sí filtra por estado, pero `venderPedido`
  y `marcarEsperandoPago` actualizan sin condición: un `checkout.session.completed` tardío puede
  regresar un pedido `completed` a `awaiting_payment`.
- **Búsqueda visual:** la ruta usa un prompt distinto al que indexa (`lib/embeddings.ts`) y tiene
  doble rate limit.
- **RLS (migración, número lo asigna el humano).**
  - `orders_insert_any` y `order_items_insert_any` (`with check (true)`, en `0001`) dejan a `anon`
    insertar `order_items` en cualquier pedido cuyo id conozca, empezando por el suyo (el `orderId`
    que devuelve `createCheckoutSessionAction`). `mark_order_sold` confía en esos items y marca
    vendidas prendas que no se cobraron.
  - `profile_update_own` deja que un usuario cambie su propio `role`.
  - `product_images` y `product_attributes` son legibles aunque la prenda no esté publicada.
  - `match_products_by_image` se puede llamar directo, saltando el rate limit.
  - El trigger `brands_updated_at` tiene sintaxis inválida (`0007`).
  - Los buckets `product-images` y `brand-logos` no están en ninguna migración.
- **Checkout.**
  - `cancelCheckoutAction` no pide auth.
  - El cliente se bloquea a sí mismo si recarga, porque su reserva anterior sigue viva.
  - `success` dice "Pedido confirmado" aunque el pago esté pendiente (OXXO/SPEI) y promete un
    correo que no existe.
  - No hay rate limit en `createCheckoutSessionAction`.
- **Caché.** El webhook no hace `revalidateTag('products')` después de vender.
- **Admin.**
  - `createProduct` publica (`listed = true`) antes de validar la foto.
  - Quitar la imagen principal deja la prenda sin `is_primary`.
  - Fondos registra como "dinero sin pedido" **toda** transacción `funded` de saldo de cliente, así
    que probablemente cada pago SPEI normal aparece ahí (verificar contra eventos reales de Stripe).
  - Borrar una marca falla por la FK, pero el logo ya se borró del storage.
- **Talla** (decidido 2026-10-14): vuelve al formulario del admin como atributo `Talla`
  (`product_attributes`). Se reutiliza `saveAttributes`, que hoy está sin uso.

### Etapa 2 — Sistema de diseño (referencia Grailed)

Objetivo: que se vea como la GUI objetivo y que cambiar el diseño sea editar un solo lugar.

- **Tokens en `tailwind.config.ts`**: color, tipografía, tamaños, radios (incluido el botón
  píldora) y bordes finos. Las fuentes se cargan con `next/font`, no con `@import`. Se eliminan
  los `fontFamily` y `style={}` inline.
- **Primitivas en `components/ui/`**: Button (sólido, contorno, píldora), Input, Tabs (píldoras),
  ListRow, Badge y Card. Usan `clsx`.
- **`ProductCard` estilo feed:**
  - foto grande de borde a borde, en 2 columnas en móvil;
  - debajo: **marca** (con tipo de prenda si cabe, truncado con «…») a la izquierda y **talla** a la derecha;
  - luego **precio** en negritas y **corazón** (que alimenta la wishlist real).
  - Se mantienen los estados vendida y apartada, que se muestran distinto a propósito.
- **Header** partido en piezas. Categorías **desde la tabla `categories`** (una sola fuente) y el
  input de búsqueda visual siempre montado.
- **Home = feed.** Saludo si hay sesión ("Bienvenido, {nombre}"), secciones ("Lo nuevo",
  "Para ti" cuando exista) y grid.
- **Páginas reales** en lugar de placeholders:
  - envíos y devoluciones leen `settings` y `pickup_points`;
  - soporte con el contacto real;
  - la guía de tallas explica las **medidas por pieza**;
  - legal pasa a i18n.
- **Strings hardcodeados a `messages/`.** Se borran las ~108 claves sin uso.
- **Moneda en `/en`:** mostrar MXN o dejar USD convertido **(humano)**.
- **Flujos de una pieza:** `/cart` sin chrome duplicado (o se elimina, porque el drawer ya va a
  checkout), checkout partido en componentes, y cuenta con layout propio y estilo del modal de registro.

### Etapa 3 — Ecommerce completo para el comprador (último código de Fase 1)

La Fase 1 no se cierra al terminar esta etapa: se cierra cuando se cumple la puerta de OPEN § Puertas.

- Wishlist real con corazón en la tarjeta y la ficha (localStorage; en DB si hay sesión).
- Búsqueda por marca, talla y tienda. Hoy solo busca en nombre, descripción y categoría.
- Pedidos de invitado ligados a la cuenta por email. La libreta de direcciones se usa en checkout.
- Detalle de pedido con estado de pago y nombre del punto de entrega, no su id.
- Correos transaccionales **(humano: proveedor)**.
- Stripe live y webhook con los eventos correctos **(humano: ops)**.

### Etapa 4 — Marketplace, Fase 2 (solo con la puerta abierta)

- **Identidad de vendedor:** Supabase Auth + `store_members` (o `stores.owner_user_id`). Nunca
  sobre `profiles.role` sin cerrar antes su RLS.
- **Admin:** revisar y aprobar `store_applications`, y crear tiendas.
- **Panel de vendedor** (referencia `03-sell-dashboard.png`): en venta, vendido, borradores y
  agregar prenda. Reutiliza el patrón de filtro en la consulta que ya usa la vista de Mario.
- **Pedidos:** `store_id` (y `owner`) como snapshot en `order_items`. Una tienda pausada saca sus
  prendas del catálogo y del checkout.
- **Modelo Mario vs. tiendas** **(humano)**: `owner` es `text not null` con CHECK `uzziel|mario`
  (`0010`), así que toda prenda, incluida la de una tienda externa, queda atribuida a Uzziel o a
  Mario. Además, la cuenta Connect de Mario no tiene dónde vivir: `stripe_account_id` está en
  `stores` y Mario no es tienda.
- **Connect para tiendas externas.** El Connect de Mario **no** espera a esta etapa (ver abajo).
- `/vender` se reescribe para tiendas de segunda mano y sin promesas falsas: hoy promete
  "comisiones competitivas, pagos puntuales, audiencia global".

### En paralelo — Connect para Mario (paquete E, carril L7)

No depende de las etapas ni de la puerta de Fase 2. En Fase 1 es el payout de Mario por
`owner = 'mario'` con comisión 0 %, al marcar Entregado. Se abre solo cuando el humano responda
OPEN § Connect (puntos 1 y 2) y escriba `L7 desbloqueado` en STATUS. Antes conviene haber cerrado
la Etapa 1, porque el método de pago mal grabado afecta la conciliación.

### Etapa 5 — Fase 3

Seguir diseñadores, vendedores y búsquedas (`01-follows.png`), feed personalizado, preferencia de
departamento (`04-onboarding-preferencia.png`), ofertas, reviews, comisión automática, Skydropx y
registro abierto.

---

## 7. Cómo se trabaja con agentes

- Lectura: **este archivo** → [`agents/README.md`](./agents/README.md) → `STATUS` → `FROZEN` → `OPEN` → tu paquete.
- Un agente = un paquete = una rama = un PR. Nunca push ni merge a `main`; el humano mergea.
  Detalle en [`agents/GIT.md`](./agents/GIT.md).
- **Serializado siempre:** `middleware.ts`, `package.json`, `package-lock.json`, `.env*` y el
  número de migración.
- **DoD:** `npm run type-check` + `npm run lint` limpios. Si tocaste stock o checkout, corre
  además los smokes `npm run test:stock` y `npm run test:checkout`. **Ojo:** los smokes escriben
  en la base que diga `.env.local`, que hoy es prod.
- Al cerrar un paquete se actualiza solo `STATUS.md`. Si cambia el rumbo o el plan, se actualiza
  este archivo. Si cambia una decisión, se agrega una línea a FROZEN.
- Si la tienda se ve vacía, revisa primero si Supabase pausó el proyecto (plan Free). No es un bug.

---

## 8. Por decidir (humano)

Respuestas que desbloquean etapas. Las de negocio de largo plazo siguen en [`agents/OPEN.md`](./agents/OPEN.md).

| # | Pregunta | Bloquea |
|---|---|---|
| 1 | ~~¿Acento de color?~~ **Decidido 2026-10-14:** azul de Grailed como acento principal (CTA de registro, acciones primarias). Verde solo para cosas muy puntuales (promos, confirmaciones). La base sigue en B/N | — |
| 2 | ¿Qué tipografías? **Rumbo decidido 2026-10-14:** lo más parecido posible a las de Grailed (sacar sus parámetros: familia, pesos, tamaños, tracking), sin perder las que ya usa la tienda (Helvetica Neue / Inter), que también gustan. Falta elegir las fuentes concretas con una prueba visual | Etapa 2 |
| 3 | ~~¿La talla vuelve al formulario del admin?~~ **Decidido 2026-10-14: sí.** Vuelve como atributo `Talla` (FROZEN § Datos) | — |
| 4 | `public/products/*.png` (13 fotos, 3.1 MB, sin uso): ¿se borran o se guardan fuera del repo? | Etapa 0 |
| 5 | Políticas reales de envío, devolución y contacto (WhatsApp, correo) para escribir las páginas | Etapa 2 |
| 6 | ¿`/en` sigue mostrando USD convertido si Stripe cobra MXN? | Etapa 2 |
| 7 | ~~¿Studio se sigue usando?~~ **Decidido 2026-10-14:** hoy no se usa, pero **no se borra**. Se deja como está (código, tablas, `studio-assets`) | — |
| 8 | ¿Proveedor de correo transaccional? | Etapa 3 |
| 9 | ¿Cómo conviven `owner` (Mario) y las tiendas externas, y dónde vive la cuenta Connect de Mario? | Etapa 4 |
