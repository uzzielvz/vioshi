# AUDITORÍA PRE-LANZAMIENTO — VIOGI

**Fecha:** 2026-08-31 · **Commit base:** `6397493` · **Verificado contra código, no contra docs.**
Método: lectura directa de los 130 archivos de `app/`, `components/`, `lib/`, `store/`, `types/` (16,392 líneas) + 9 migraciones SQL + censo automatizado de valores CSS.

---

## 1. RESUMEN EJECUTIVO

**No está lista. No lances en 7 días con checkout abierto.**

Lo que lo impide no es la interfaz — es que **el sistema no sabe que tu inventario es único**. No existe control de stock en ninguna capa: ni en el carrito, ni en el checkout, ni en el webhook de Stripe. Dos personas pueden pagar la misma prenda con minutos de diferencia y ambas recibirán confirmación. El flag `sold_out` es puramente cosmético: oculta el botón en la ficha, pero el checkout nunca lo consulta, así que una prenda marcada como vendida sigue siendo comprable desde un carrito ya cargado.

Segundo bloqueante: **Stripe está en modo test** (`sk_test_…`). Hoy no puedes cobrar un peso. No hay SPEI ni OXXO; el `PaymentIntent` está forzado a `payment_method_types: ['card']`.

Tercero, y crítico para tu canal: **no existe una sola etiqueta Open Graph en el proyecto**. Cero `generateMetadata`. Un link de prenda pegado en WhatsApp o en tu bio de Instagram se ve como un rectángulo gris con el texto "VIOGI - Premium Accessible Streetwear". El 95% de tu tráfico llega por ese link y ese link no vende.

Además: el envío está en **$10 MXN** (valor de plantilla en USD) — pierdes ~$150 por pedido; el IVA se **suma 16% encima** del precio mostrado, así que una prenda de $1,000 cobra $1,160 + envío en la última pantalla; y **la talla nunca se muestra en la tienda** porque el mapeo de datos jamás la puebla.

La interfaz está peor de lo que crees en números y mejor de lo que crees en estética: el problema es dispersión, no mal gusto. Hay **67 valores de color distintos** (19 de ellos grises), **18 tamaños de texto**, **22 estilos de botón** y **152 declaraciones inline de tipografía** copiadas a mano. La librería `components/common/` (Button, Input, Badge, Spinner) existe, está bien hecha y tiene **cero importaciones en todo el repo**.

**Camino realista:** los 6 bloqueantes de dinero son ~19 horas. Son alcanzables en 7 días. Lo que no es alcanzable es eso *más* el rediseño. Lanza con los bloqueantes cerrados y la ficha de producto arreglada; el sistema de tokens se migra después sin tocar la lógica.

---

## FASE A — AUDITORÍA TÉCNICA

### A1. Inventario del proyecto

| Capa | Tecnología | Versión | Nota |
|---|---|---|---|
| Framework | Next.js App Router | 14.2.35 | Latest es 16.3.3 |
| UI | React | 18.3.1 | |
| Lenguaje | TypeScript 5.9.3 strict | ✅ | `tsc --noEmit` pasa limpio |
| Estilos | Tailwind 3.4.19 | | Config prácticamente vacía (27 líneas) |
| DB | Supabase / PostgreSQL + pgvector | | 9 migraciones |
| ORM | Ninguno — cliente Supabase directo | | |
| Pagos | Stripe 22.1.1 | **modo test** | |
| IA | `@google/genai` 2.18.0 | | Gemini para visual search + studio |
| i18n | next-intl 4.7.0 | | es/en, `localePrefix: 'always'` |
| Hosting | Vercel (inferido: `.vercel` en gitignore, `outputFileTracingIncludes`) | | Sin `vercel.json` |

**Discrepancia con la documentación:** `CLAUDE.md` describe un proyecto mucho más chico del que existe. No menciona i18n, Stripe, auth de clientes, panel admin ni el Studio de Gemini. La ruta del carrito documentada (`app/(shop)/cart/`) hoy vive en `app/[locale]/(shop)/cart/`. **Actualizar `CLAUDE.md` es deuda documental real** — cualquier agente o dev nuevo va a operar con un mapa equivocado.

**Vulnerabilidades:** `npm audit --omit=dev` → **7 (6 high, 1 moderate)**.
- `next@14.2.35` — 21 advisories abiertos. Los relevantes para ti: *cache poisoning en RSC responses*, *SSRF en Server Actions*, *unauthenticated disclosure of internal Server Function endpoints*. Corrigen en 16.x (breaking).
- `nanoid`, `ws`, `protobufjs` (transitivas, high) — `npm audit fix` las resuelve sin breaking.

**Dependencias desactualizadas:** 20 de 22. Ninguna abandonada. Las de Stripe y Supabase van 1-2 minors atrás, sin riesgo.

**Variables de entorno requeridas** (`.env.local`, correctamente ignorado por git — solo `.env.example` está trackeado):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_USD_MXN_RATE`.

---

### A2. Modelo de datos — contraste contra un e-commerce de segunda mano

Esquema actual de `products` (`supabase/migrations/0001_initial_schema.sql:90`):
`id, slug, name, description, price_mxn, original_price_mxn, category_id, sku, material, made_in, is_featured, is_new, sold_out, created_at, updated_at` + `brand_id` (0007) + `embedding vector(768)` (0003).

| Necesitas | ¿Existe? | Dónde / qué falta |
|---|---|---|
| Marca | ✅ | `brands` (0007), `brand_id`. Bien resuelto. |
| Tipo | ✅ | `categories` |
| Talla marcada | ⚠️ **rota** | `product_variants.size` existe pero **la app nunca consulta esa tabla**. Ver bug abajo. |
| Medidas reales (pecho, largo, cintura, tiro, manga) | ❌ | No existe. Único vehículo: `product_attributes` (key/value texto libre). |
| Estado en 3 niveles | ❌ | No existe. Ni columna ni enum. |
| Defectos / notas de honestidad | ❌ | No existe. |
| Costo de adquisición | ❌ | No existe. **Sin esto no puedes calcular margen.** |
| Precio | ✅ | `price_mxn numeric(10,2)` |
| Fecha de alta | ✅ | `created_at` |
| Drop | ❌ | No existe como entidad. `app/[locale]/archive/` tiene drops **hardcodeados en el componente**. |
| SKU único | ✅ | `sku text unique` (nullable, y el form no lo autogenera) |
| Fotos con orden explícito | ✅ | `product_images.sort_order` + `is_primary`. Bien. |

**Lo que sobra:** `promo_codes` (tabla completa, cero uso), `product_variants` (7 columnas, cero uso), `wishlist_items` (la wishlist real usa localStorage), `exchange_rate` en orders (nunca se escribe), `invoice_requested`/`cfdi_uuid`/`cfdi_pdf_url` (facturación no implementada), `rating`/`reviewCount`/`ProductReview` en `types/product.ts` (tipos huérfanos sin tabla).

**Mal tipado:**
- `types/product.ts` define un `Product` rico con `stock: number`, `sizes`, `colors`, `reviews` — **ninguno se usa**. La app corre sobre `ProductData` de `lib/products.ts:6`. Dos modelos de producto en paralelo, uno de ellos ficción.
- `payment_method` en `orders` tiene `check (… in ('card','paypal','apple_pay','google_pay'))` — **no admite `'spei'` ni `'oxxo'`**. El día que actives SPEI/OXXO, el INSERT falla.
- `lib/products.ts:32` declara `price_mxn: string` y hace `parseFloat`. Correcto pero frágil.

#### 🔴 BUG CRÍTICO — La misma prenda se puede vender dos veces

Esto es exactamente lo que preguntaste y la respuesta es la peor posible: **no hay lock, no hay transacción, no hay reserva, y tampoco hay decremento.**

Traza completa de escritura de stock en el repo — no existe ninguna:

1. `lib/cart/reconcile.ts:44` — el carrito se reconcilia contra la DB con
   `.select('id, slug, name, price_mxn')`. **No trae `sold_out`. No lo evalúa.**
2. `app/[locale]/checkout/actions.ts:93` — `createPaymentIntentAction` consulta
   `.select('id, price_mxn')` y valida **solo el precio** (línea 107). **Nunca consulta `sold_out` ni `stock`.**
3. `app/api/webhooks/stripe/route.ts:46` — en `payment_intent.succeeded` hace
   `UPDATE orders SET payment_status='completed', status='processing'`.
   **No toca `products`. No pone `sold_out = true`. No decrementa `product_variants.stock`.**

Consecuencias, en orden de costo:

- **Doble venta.** A y B abren la misma prenda, ambos pagan. Stripe cobra las dos veces. Tú tienes una unidad. Reembolso + cliente perdido + reputación en un negocio que vive de Instagram.
- **La prenda nunca se cae del catálogo sola.** Después de una venta legítima sigue publicada y comprable hasta que entres al admin y marques el checkbox a mano.
- **`sold_out` es decorativo.** `ProductContent.tsx:298` esconde el botón, pero si la prenda ya está en el carrito (localStorage, sesión anterior, otra pestaña) el checkout la procesa sin chistar. Marcarla vendida en el admin **no la protege**.

**Cómo garantizarlo (recomendación concreta).** No uses un lock aplicativo ni un `SELECT` previo — sigue habiendo ventana de carrera entre el `SELECT` y el `INSERT`. Usa el propio motor:

```sql
-- 1. Reserva atómica: solo tiene éxito si la prenda sigue disponible.
--    El UPDATE condicional es el lock. Si devuelve 0 filas, alguien ganó.
create or replace function public.reserve_products(p_ids uuid[], p_order_id uuid)
returns int language plpgsql as $$
declare reserved int;
begin
  update public.products
     set sold_out = true, reserved_order_id = p_order_id, reserved_at = now()
   where id = any(p_ids)
     and sold_out = false;
  get diagnostics reserved = row_count;
  if reserved <> array_length(p_ids, 1) then
    raise exception 'product_unavailable';   -- revierte todo el statement
  end if;
  return reserved;
end $$;
```

- Llama `reserve_products` **antes** de crear el `PaymentIntent`, en `checkout/actions.ts` justo después de validar precio (~línea 110). Si lanza, devuelve un nuevo error `'product_unavailable'` al cliente.
- En `payment_intent.payment_failed` y `payment_intent.canceled` del webhook: libera (`sold_out=false, reserved_order_id=null`).
- Añade un cron/`pg_cron` que libere reservas con `reserved_at < now() - interval '30 minutes'` y pago no completado — si no, un carrito abandonado congela la prenda para siempre.

Requiere migración `0010`: `alter table products add column reserved_order_id uuid, add column reserved_at timestamptz;`

**Esfuerzo: 4 h.** Es la línea entre operar y no operar.

---

### A3. Flujo de compra — recorrido archivo por archivo

| # | Pantalla | Archivo | Clics | Campos | ¿Login? |
|---|---|---|---|---|---|
| 1 | Home | `app/[locale]/page.tsx` | 1 (SHOP NOW) o scroll | 0 | No |
| 2 | Listado | `app/[locale]/collections/[category]/page.tsx` → `ProductGrid` → `ProductCard` | 1 | 0 | No |
| 3 | Ficha | `products/[slug]/page.tsx` → `ProductContent.tsx` | 1 (ADD TO BAG) | 0 | No |
| 4 | Cart drawer | `components/CartDrawer.tsx` (auto-abre, `ProductContent.tsx:57`) | 1 (checkout) | 0 | No |
| 5 | Checkout datos | `app/[locale]/checkout/page.tsx` (1,080 líneas) | ~4 | **10** | **No ✅** |
| 6 | Checkout pago | mismo archivo, `clientSecret` monta `<Elements>` (línea 893) | 2 | 3-4 (Stripe) | No |
| 7 | Return | `checkout/return/page.tsx` (redirect automático) | 0 | 0 | No |
| 8 | Confirmación | `checkout/success/[orderId]/page.tsx` | — | — | No |

**Contra tu meta:**

| Meta | Real | Veredicto |
|---|---|---|
| Compra sin registro | ✅ guest checkout funciona, `orders.user_id` nullable | **Cumplido** |
| Máximo 3 campos | **10 campos** (envío a domicilio) | ✗ 3.3× la meta |
| Checkout de una pantalla | 1 ruta, pero **2 pasos** con re-render completo | ~Parcial |
| Pantallas entre "me gusta" y "ya pagué" | **4** (ficha → drawer → datos → pago) | Aceptable |

Los 10 campos (`checkout/page.tsx:651-793`): `email`, `firstName`, `lastName`, `address`, `apartment`, `zipCode`, `colonia`, `municipio`, `state`, `phone`. Hay un acierto: `lib/mexico.ts` autocompleta municipio/estado desde el CP y los pone `readOnly` (líneas 762-766). Eso ya te ahorra 2.

**Para acercarte a 3-4 sin romper nada:** `apartment` es opcional (fusiónalo en `address` como una sola línea), `firstName`+`lastName` pueden ser un campo (`nombre completo`), y `colonia` ya viene del CP como `<select>` cuando SEPOMEX responde. Eso baja a **6 campos** con ~2 h de trabajo. Bajar de 6 con envío a domicilio en México no es realista.

**Fricción no contabilizada:** el checkout es una tabla de 1,080 líneas en un solo componente cliente. `pickup` carga `PICKUP_POINTS` con **8 puntos de recolección seed que no existen** (flagship CDMX, GDL, tiendas MTY/QRO, partners en Puebla/Tijuana/Cancún/Mérida — `0001_initial_schema.sql:371`). Si un cliente elige "recoger en Av. Reforma 222" tienes un problema operativo real. **Desactiva pickup o deja solo puntos reales antes de lanzar.**

---

### A4. Pagos

| Aspecto | Estado |
|---|---|
| Pasarela | Stripe (`lib/stripe.ts`, `@stripe/react-stripe-js` 6.4.0) |
| **Modo** | 🔴 **TEST** — `.env.local` tiene `sk_test_…` / `pk_test_…` |
| Métodos habilitados | 🔴 **Solo tarjeta.** `checkout/actions.ts:220`: `payment_method_types: ['card']` con comentario *"Card-only in v1 — fewer moving parts while debugging E2E"* |
| SPEI | ❌ No |
| OXXO | ❌ No |
| Mercado Pago | ❌ No integrado en ninguna parte |
| Webhook | ✅ Firma verificada (`route.ts:26`), `runtime='nodejs'`, body raw. **Bien hecho.** |
| Idempotencia | ✅ `UPDATE … WHERE payment_reference = X` es idempotente |
| Reintentos | ✅ Devuelve 500 en fallo de DB para que Stripe reintente |
| Eventos manejados | `payment_intent.succeeded`, `payment_intent.payment_failed`. **Faltan `canceled`, `requires_action`, `charge.refunded`, `charge.dispute.created`** |

**Qué pasa si el pago falla a medias:**
- Fallo antes del PaymentIntent → rollback correcto de `orders` y `order_items` (líneas 197, 224). ✅
- Fallo *durante* → la orden queda `payment_status='pending'` para siempre. No hay job de limpieza. **Y con el fix de A2, congelaría la prenda.** Por eso el cron de liberación no es opcional.
- Pago con `processing` (asincrónico) → `checkout/page.tsx:165` lo trata como éxito y redirige a la pantalla de confirmación. Con tarjeta es tolerable; **con SPEI/OXXO sería declarar pagado algo que no lo está.**

#### 🔴 Sí existe un camino donde un pedido se ve confirmado sin cobro

**Dos, de hecho:**

1. `checkout/success/[orderId]/page.tsx:62-81` — si la orden **no se encuentra**, la página responde con un `<div>` que dice literalmente **"Pago registrado correctamente."** Sin haber leído nada de la DB. Cualquiera que abra `/es/checkout/success/loquesea` recibe ese mensaje.
2. Línea 106 — cuando la orden **sí** se encuentra, el `<h1>` dice **"PEDIDO CONFIRMADO"** sin condicionar a `payment_status`. Una orden `pending` o `failed` renderiza el mismo título; la única diferencia es una etiqueta gris de 11px que dice "Pago pendiente" (línea 139-141).

**Fix:** condicionar título, ✓ y copy a `order.payment_status === 'completed'`; eliminar el fallback optimista de la línea 62. **1 h.**

**Para operar con dinero real te falta:**
1. Claves `sk_live_`/`pk_live_` + `STRIPE_WEBHOOK_SECRET` de producción (endpoint live registrado en el dashboard).
2. Cambiar a `automatic_payment_methods: { enabled: true }` y habilitar OXXO + SPEI en el dashboard de Stripe MX.
3. Extender el `check` de `orders.payment_method` para aceptar `'spei'`, `'oxxo'`.
4. Manejar el flujo asíncrono: OXXO/SPEI dejan el PI en `requires_action` con un voucher. La orden debe quedar **"esperando pago"**, no "confirmada", y solo pasar a `processing` con el webhook.
5. Manejar `charge.refunded` y `charge.dispute.created`.
6. Corregir `STANDARD_SHIPPING_COST` (ver A-extra).

---

### A5. Panel de admin — velocidad operativa

Este es tu cuello de botella y hoy **no cumple los 3 minutos**.

**Publicar una prenda desde cero** (`/admin/products/new` → `ProductForm.tsx`, 382 líneas):

| Paso | Campos | Tiempo estimado |
|---|---|---|
| Subir fotos | 1 (multiple ✅) | 20 s + espera de subida |
| Name | 1 | 10 s |
| Slug | auto ✅ (`toSlug`, línea 124) | 0 s |
| Category / Brand | 2 selects | 10 s |
| Price / Original Price | 2 | 15 s |
| SKU / Made In | 2 | 15 s (SKU **manual**, sin autogenerar) |
| Material | 1 | 10 s |
| Description | 1 textarea | 60-90 s ← el costo real |
| Características (talla, condición, medidas…) | key/value **a mano, uno por uno** | 90-150 s ← el otro costo real |
| Checkboxes | 3 | 5 s |

**Total realista: 4-6 minutos por prenda.** Con 7 prendas es tolerable. A 30/semana te come 3 horas.

| Capacidad | Estado | Detalle |
|---|---|---|
| Múltiples fotos a la vez | ✅ | `ImageUploader.tsx:51` `multiple` |
| **Compresión / optimización** | 🔴 **No existe** | `actions.ts:161` sube el `Buffer` crudo. Límite 5 MB/foto. Una foto de iPhone son 3-4 MB → **una prenda con 5 fotos = 18 MB en el bucket**, servidos vía `next/image` (que sí optimiza en entrega, pero pagas almacenamiento y la subida desde móvil es lentísima) |
| Duplicar prenda similar | ❌ | No existe |
| Carga masiva / CSV | ❌ | No existe |
| **Marcar "vendido" en 1 clic** | 🔴 **No** | Requiere: abrir `/admin/products` → clic en la prenda → scroll al final del form → marcar checkbox → SAVE. **5 pasos.** (Existe `ToggleButton.tsx` de un clic para brands y pickup-points — el patrón ya está resuelto, solo no se aplicó a products) |
| Búsqueda/filtro en la lista | ❌ | `admin/products/page.tsx` lista todo sin filtro |

**Reportes: no existe ninguno.** `/admin/page.tsx` no tiene dashboard de negocio. No puedes ver inversión (no hay campo de costo), ni ingreso, ni margen, ni días en inventario, ni por prenda ni por drop. **Estás operando a ciegas sobre tu propia rentabilidad.**

*Nota:* el Studio de Gemini (`app/admin/studio/`, ~1,700 líneas) es la pieza más sofisticada del repo y genera fotos de catálogo/modelo a partir de fotos crudas. Es un multiplicador real de velocidad — pero resuelve la foto, no el llenado de datos, que es donde se van los 4 minutos.

---

### A6. Buscador visual (Gemini) — el diferenciador

**Cómo funciona** (`app/api/visual-search/route.ts`, 114 líneas):

1. `POST /api/visual-search` con `FormData` (`image`). Valida MIME (`jpeg|png|webp`) y tamaño (**10 MB**, línea 26).
2. **Gemini 2.5 Flash** describe la prenda en una frase en inglés (≤50 palabras) — línea 56.
3. **`gemini-embedding-001`** convierte *esa descripción de texto* en un vector de **768 dims** (Matryoshka truncation) — línea 75.
4. RPC `match_products_by_image` (`0003_pgvector_and_embeddings.sql:444`) — distancia coseno `<=>` sobre `products.embedding`, índice `ivfflat` con `lists=100`, `limit 3`.
5. Se hidratan las imágenes primarias y se devuelve `{ results, ai_description }`.

**Punto arquitectónico importante:** la similitud **no es imagen-contra-imagen**. Es texto-contra-texto: la descripción generada de tu foto vs. la descripción generada de cada prenda. Todo lo que Flash no mencione en esas 50 palabras es invisible para la búsqueda. Es una decisión defendible y barata, pero condiciona la calidad — y explica por qué a veces "acierta el color y falla la silueta".

| Métrica | Valor |
|---|---|
| Latencia | **2 llamadas Gemini secuenciales** + RPC. Realista: **2.5-5 s**. Sin streaming ni feedback de progreso más allá de la animación. |
| Costo por consulta | ~$0.0003-0.0008 USD (Flash describe ~300 tokens + embedding). **Despreciable** salvo abuso. |
| Caché | 🔴 **Ninguna.** Misma foto = costo completo otra vez. |
| Si la API falla | Devuelve 502 (`description_failed` / `embedding_failed`) o 500. **No hay fallback a búsqueda por texto.** El usuario ve un error y se queda sin nada. |
| Rate limit | ⚠️ **Doble y contradictorio**: `middleware.ts:25` aplica 10/min; `route.ts:10` aplica 5/min con un `Map` propio. El de la ruta gana. Ambos son in-memory por isolate → **no global en Vercel**. |
| Límite de imagen | 10 MB en la ruta (vs. 5 MB en el resto del proyecto — inconsistente) |
| Embeddings nuevos | 🔴 **Manual.** `scripts/generate-embeddings.ts` se corre a mano. **Una prenda publicada hoy es invisible al buscador hasta que ejecutes el script.** |

**Exposición actual en la interfaz: casi nula.** Está detrás de un ícono de cámara *dentro del overlay de búsqueda del Header* (`Header.tsx:727-755`), que a su vez requiere abrir la búsqueda. Son **3 interacciones** para llegar a tu diferenciador, y ninguna lo nombra. Un visitante de Instagram nunca lo va a encontrar.

**Para ponerlo al frente:** un bloque en la home, arriba del grid, con copy explícito ("¿Viste algo que te gustó? Súbelo y te decimos si lo tenemos") y un input de cámara directo — `capture="environment"` para que en móvil abra la cámara, no la galería. **3 h.** Es la mejora de posicionamiento más barata del informe. Antes hay que resolver el auto-embedding, o el buscador contestará "no tenemos nada" sobre un catálogo que sí tiene.

---

### A7. Rendimiento móvil (4G lenta)

No corrí Lighthouse (requiere el sitio desplegado). Esto es análisis estático del código que determina esas métricas.

| Aspecto | Estado |
|---|---|
| Formatos modernos | ✅ `next/image` sirve AVIF/WebP automáticamente |
| `srcset` / `sizes` | ⚠️ **Solo en `ProductCard.tsx:57`**. `ProductContent.tsx:112` y `:132` usan `fill` **sin `sizes`** → el navegador asume `100vw` y descarga la imagen full-width en móvil |
| Lazy loading | ✅ por defecto; `priority` correcto en la primera foto |
| **Layout shift (CLS)** | 🔴 `ClientLayout.tsx:29-35`: hasta que hidrata, **no renderiza el Header**. Aparece de golpe al montar. CLS visible en cada carga. |
| Peso de fuentes | 🔴 `globals.css:1-2` — **dos `@import` de Google Fonts** (Inter 4 pesos + Bebas Neue). Un `@import` en CSS es render-blocking en cadena (el navegador descarga el CSS, *luego* descubre la fuente). Sin `next/font`, sin `preconnect`, sin `font-display` controlado. **Bebas Neue se usa en 2 lugares y ambos son del admin** — es peso puro para el cliente. |
| Payload de la ficha | ⚠️ `products/[slug]/page.tsx:18` hace `getProducts()` y pasa **el catálogo completo** a un componente cliente solo para calcular anterior/siguiente. Todo el catálogo (descripciones, atributos, URLs) se serializa en el HTML de cada ficha. Con 7 prendas: irrelevante. Con 200: varios cientos de KB por página. |
| Peso de imágenes en origen | 🔴 Sin compresión en subida (ver A5). |
| Home: primera foto visible | 🔴 El hero es `py-32 md:py-48` (`page.tsx:15`) = **128 px arriba y abajo en móvil** con solo la palabra "VIOGI". **La primera prenda está debajo del fold.** Alguien que llega de Instagram ve una pantalla en blanco con un logo. |

**¿Home usable en <3 s?** Probable que sí en tiempo técnico (7 productos, ISR de 60 s, Vercel edge). Pero **"usable" no es "útil"**: a los 3 segundos el usuario ve un logo y un botón, no producto. La métrica que importa para ti no es LCP, es *tiempo hasta la primera prenda visible*, y ahí fallas por diseño, no por performance.

**Arreglos de alto retorno:** quitar el hero gigante o reducirlo a `py-12` (**15 min**); migrar a `next/font` y borrar Bebas del bundle público (**1 h**); añadir `sizes` en `ProductContent` (**15 min**); renderizar el Header en SSR (**1 h**).

---

### A8. Seguridad

**Lo que está bien hecho** (vale la pena decirlo): sesión admin con HMAC-SHA256 vía Web Crypto, sin el secreto en la cookie, con expiración (`lib/admin/session.ts`) · middleware protege `/admin` y `/api/admin` (`middleware.ts:43-58`) · webhook de Stripe con firma verificada · RLS habilitado en las 11 tablas · migración `0005` revoca `select(embedding)` a `anon` · totales del pedido calculados server-side, nunca del cliente (`checkout/actions.ts:133`) · `handle_new_user` con `search_path = public`.

| # | Severidad | Hallazgo | Archivo:línea |
|---|---|---|---|
| S1 | 🔴 **Crítico** | **IDOR — fuga de datos personales.** `getGuestOrderByPaymentIntent()` usa el **service role** y filtra únicamente por `payment_reference` + `user_id is null`. **No verifica ningún token.** El `SELECT` es `'*, order_items(*)'`, o sea devuelve `email`, `guest_token`, montos y todos los ítems. Se alcanza sin autenticación desde `/[locale]/checkout/success/<cualquier-cosa>?payment_intent=pi_…`. Los IDs `pi_` viajan en la URL tras el redirect de Stripe, quedan en historial, en logs de referrer y en cualquier link compartido. | `lib/orders.ts:110-121`, consumido en `success/[orderId]/page.tsx:56` |
| S2 | 🔴 **Crítico** | **`ADMIN_SECRET` débil.** El valor real en `.env.local` empieza con `admin1…`. Ese secreto firma **la sesión de admin y los `guest_token` de todos los pedidos**. Adivinarlo = panel completo + service role indirecto. | `.env.local` |
| S3 | 🟠 Alto | **Pedido "confirmado" sin verificar pago** (detallado en A4). | `success/[orderId]/page.tsx:62,106` |
| S4 | 🟠 Alto | **Sin validación de esquema en el checkout.** `CheckoutFormData` se recibe en la Server Action y se inserta sin validar (`email` sin formato, `zipCode` sin patrón, sin límites de longitud). No hay Zod ni equivalente en todo el repo. | `checkout/actions.ts:74` |
| S5 | 🟠 Alto | **Rate limit no distribuido.** In-memory por isolate en Vercel; cada instancia tiene su propio `Map`. El de admin login (`ADMIN_LOGIN_RATE_LIMIT`, 5/15 min) es evadible escalando instancias. | `lib/rate-limit.ts:5-8` (documentado, no resuelto) |
| S6 | 🟠 Alto | **21 CVEs abiertos en `next@14.2.35`**, incluyendo *disclosure of internal Server Function endpoints* y *SSRF en Server Actions*. | `package.json` |
| S7 | 🟡 Medio | **Subida de archivos sin verificar contenido.** `actions.ts:150` confía en `file.type`, que lo manda el cliente. No se leen magic bytes. El bucket `product-images` es público. | `admin/products/actions.ts:150` |
| S8 | 🟡 Medio | **`orders_insert_any` / `order_items_insert_any` con `with check (true)`.** Cualquiera con la anon key puede insertar pedidos arbitrarios. Hoy la app no lo usa (todo va por service role) — el riesgo es basura en la tabla, no fuga. Deberían revocarse. | `0001_initial_schema.sql:336,344` |
| S9 | 🟡 Medio | **Sin cabeceras de seguridad.** `next.config.js` no define CSP, HSTS, `X-Frame-Options` ni `Referrer-Policy`. Sin `Referrer-Policy` el `pi_…` de la URL se filtra a terceros — lo que amplifica S1. | `next.config.js` |
| S10 | 🟡 Medio | **Endpoint de debug expuesto.** `/api/dev/stripe-payment-status` no está bajo `/api/admin`, así que **el middleware no lo protege**. | `app/api/dev/stripe-payment-status/route.ts` |
| S11 | 🟡 Medio | **Ruta `/checkout/success/pending`.** `return/page.tsx:42` redirige ahí, pero no existe tal segmento estático → cae en `[orderId]` con `orderId='pending'` y dispara el fallback optimista de S3. | `checkout/return/page.tsx:42` |

**CORS:** no hay configuración explícita; las rutas son same-origin y Next no añade `Access-Control-Allow-Origin` por defecto. Correcto por omisión.

---

### A9. SEO y compartibilidad — **el canal es esto**

🔴 **No existe una sola etiqueta Open Graph en el proyecto.**

Búsqueda exhaustiva de `generateMetadata|openGraph|twitter:|metadataBase` en todo `app/`: **2 resultados**, ambos `export const metadata` estáticos (`app/layout.tsx:4` y `app/admin/layout.tsx:5`).

| Elemento | Estado |
|---|---|
| `generateMetadata` en fichas | ❌ `products/[slug]/page.tsx` (21 líneas) no lo tiene |
| `og:title` / `og:description` | ❌ |
| `og:image` | ❌ |
| `metadataBase` | ❌ (sin él, cualquier `og:image` relativa se rompería) |
| Twitter cards | ❌ |
| `sitemap.xml` | ❌ No existe |
| `robots.txt` | ❌ No existe |
| Schema.org `Product` / `Offer` | ❌ |
| URLs legibles | ✅ `/es/products/[slug]`, slug auto-generado con normalización de acentos |
| `<html lang>` | ✅ `[locale]/layout.tsx:31` |
| `hreflang` es/en | ❌ |

**Qué pasa hoy al pegar el link de una prenda en WhatsApp:** título *"VIOGI - Premium Accessible Streetwear"*, descripción *"Shop premium accessible streetwear made in Mexico…"* y **sin imagen**. Idéntico para las 7 prendas. Nada de foto, nombre ni precio.

Para un negocio donde el 95% del tráfico entra por un link pegado en WhatsApp o en la bio de Instagram, **esto solo ya justifica no lanzar el lunes.** Es además el arreglo con mejor retorno de todo el informe: ~2 horas.

```tsx
// products/[slug]/page.tsx — añadir
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const p = await getProductBySlug(params.slug);
  if (!p) return {};
  const title = `${p.name} — ${new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(p.price)}`;
  return {
    title,
    description: p.description?.slice(0, 160) ?? `${p.name} · Pieza única · VIOGI`,
    openGraph: {
      title, type: 'website', locale: 'es_MX', siteName: 'VIOGI',
      description: p.description?.slice(0, 160) ?? 'Pieza única · VIOGI',
      images: [{ url: p.image, width: 1080, height: 1350, alt: p.name }],
    },
    twitter: { card: 'summary_large_image', title, images: [p.image] },
  };
}
```
Y en `app/layout.tsx`: `metadataBase: new URL('https://viogi.com')`.

*Nota:* tus fotos del Studio ya salen en 1080×1350 (`lib/studio/constants.ts:IG_POST_WIDTH/HEIGHT`) — ese 4:5 se recorta en el preview de WhatsApp. Considera generar una variante 1200×630 para `og:image`.

---

### A-extra. Dos errores de dinero que no encajan en ninguna categoría

**1. 🔴 El envío cuesta $10 pesos.**
```ts
// lib/constants.ts:24-26
export const STANDARD_SHIPPING_COST = 10;
export const EXPRESS_SHIPPING_COST  = 20;
```
Se usan tal cual como MXN en `checkout/actions.ts:140`. Son valores de plantilla en dólares. Un envío nacional real cuesta $120-180 MXN. **Pierdes ~$150 por pedido**, y el express ($20) cuesta menos que el estándar real. `FREE_SHIPPING_THRESHOLD = 100` (también dólares → $100 MXN) ni siquiera está conectado al cálculo. **Fix: 15 min. Impacto: ~$1,050 MXN en tus primeras 7 ventas.**

**2. 🟠 El IVA se suma encima del precio mostrado.**
`checkout/actions.ts:147`: `tax = subtotal * 0.16`, y `total = subtotal + shipping + tax`. En México el precio de venta al público se cotiza **con IVA incluido**. Una prenda de $1,000 en la ficha se cobra **$1,160 + envío** en la última pantalla. Eso es el patrón clásico de abandono de carrito, y además choca con la expectativa de PROFECO sobre precio final exhibido.

**Fix correcto:** tratar `price_mxn` como precio final con IVA incluido y *desglosarlo* en lugar de sumarlo:
```ts
const tax      = Math.round(subtotal * (TAX_RATE / (1 + TAX_RATE)) * 100) / 100; // IVA contenido
const subtotalSinIva = Math.round((subtotal - tax) * 100) / 100;
const total    = Math.round((subtotal + shippingCost) * 100) / 100;
```
Ajustar también la pantalla de confirmación (`success/[orderId]/page.tsx:177`). **1 h.**

---

## FASE B — INTERFAZ Y SISTEMA DE DISEÑO

### B1. Censo de valores visuales

#### a) Colores — **67 valores únicos**

| Fuente | Únicos | Top usos |
|---|---|---|
| Hex | **19** | `#000` (111×), `#666` (100×), `#999` (21×), `#ffffff` (7×), `#000000` (6×), `#f5f5f5` (5×) |
| rgb/rgba | **10** | `rgba(0,0,0,0.8)` (46× + 5× sin espacios), `rgba(0,0,0,0.08)` (7× + 5×) |
| Utilidades Tailwind | **38** | `text-black` (123×), `text-gray-400` (120×), `border-gray-200` (97×), `border-black` (94×) |

**Grises casi idénticos: 19.**
`#666` · `#999` · `#ccc` · `#111111` · `#9ca3af` · `#e5e7eb` · `#ebebeb` · `#f5f5f5` · `#fafafa` + `gray-50/100/200/300/400/500/600/700/800/900`.

Tres pares son indistinguibles a simple vista y conviven en la misma pantalla:
- `#e5e7eb` (Stripe appearance) vs `border-gray-200` = `#e5e7eb` vs `#ebebeb` (placeholder de ProductCard)
- `#9ca3af` (`gray-400`) vs `#999` — se usan indistintamente para texto secundario
- `#f5f5f5` (fondo de foto) vs `#fafafa` (fondo del admin) vs `bg-gray-50`

Además hay **duplicación de notación** del mismo color: `#000`/`#000000`, `#fff`/`#ffffff`, `rgba(0, 0, 0, 0.8)`/`rgba(0,0,0,0.8)`.

Y 4 colores de Google (`#4285f4`, `#ea4335`, `#fbbc05`, `#34a853`) del botón de OAuth — legítimos, no cuentan como paleta.

> **67 valores de color. Deberían ser 7.**

#### b) Tamaños de texto — **18 únicos**

| px explícito | Ocurrencias |
|---|---|
| 8px | 3 |
| 9px | 8 |
| **10px** | **181** |
| **11px** | **385** |
| 12px | 11 |
| 13px | 23 |
| 15px | 1 |
| 16px | 4 |
| 18px | 3 |
| 28px | 3 |
| 32px | 2 |
| 48px | 1 |

Más 9 clases Tailwind (`text-xs` 46×, `text-sm` 29×, `text-lg` 9×, `text-base` 3×, `text-xl`, `text-2xl`, `text-3xl`, `text-6xl`, `text-8xl`) que aportan 14, 20, 24, 30, 60 y 96 px.

**Total: 18 tamaños distintos.** El 88% del texto de la tienda vive entre 10 y 11 px.

> **18 tamaños. Deberían ser 5.**

**Y hay un problema debajo del desorden:** con 566 usos por debajo de 12px en un sitio donde el 95% del tráfico es móvil, tu tienda es difícil de leer. No es opinión de diseño: `checkout/page.tsx:237` da a los inputs `text-sm` (14px), y **Safari iOS hace zoom automático en cualquier input <16px** — el checkout literalmente salta y se descuadra al tocar el primer campo.

#### c) Tipografías — **3 sistemas en paralelo**

1. `globals.css:21` — `body` usa la stack de sistema (`-apple-system, …, Segoe UI, Roboto`).
2. `tailwind.config.ts:16` — `font-sans` repite esa misma stack de sistema.
3. **152 declaraciones inline** de `fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif"` (135 exactas + 17 variantes).

Consecuencia real, no teórica:

- En **iPhone**, todo lo que lleva el estilo inline resuelve a **Helvetica Neue**; lo que no lo lleva resuelve a **SF Pro**.
- En **Android**, no existe Helvetica Neue → cae a **Inter** (que sí se descarga vía `@import`); lo que no lleva el inline cae a **Roboto**.

O sea: **dos tipografías conviviendo en la misma pantalla, y un par distinto según el dispositivo.** Es la causa principal de esa sensación de "está disperso".

**Pesos cargados vs. usados:** se descarga Inter en 400/500/600/700. Inline se usan `fontWeight` **200, 300, 400, 500, 600, 800** — el 800 aparece **44 veces** (el CTA "ADD TO BAG", `ProductContent.tsx:305`) y **no está cargado**: el navegador sintetiza un bold falso. El botón principal de compra está renderizado con negrita artificial.

**Bebas Neue** se descarga en cada carga de la tienda y se usa en **2 lugares, ambos del admin** (`admin/login/page.tsx:32`, `admin/_components/Sidebar.tsx:21`).

> **3 stacks + 6 pesos, 1 sin cargar + 1 fuente descargada sin uso público. Debería ser 1 stack y 3 pesos.**

#### d) Espaciados — **97 utilidades únicas**

Reparto por eje: `py-3` (75×), `px-6` (58×), `px-8` (44×), `mb-4` (43×), `py-2.5` (40×), `gap-4` (38×), `mb-8` (36×), `px-4` (35×)…

Casi todo cae en la escala de Tailwind (múltiplos de 4px), así que **el espaciado es lo menos roto del sistema**. Los problemas son de coherencia, no de escala:
- **Pasos de media unidad dispersos:** `0.5`, `1.5`, `2.5`, `3.5` conviven con los enteros sin criterio. El botón principal aparece con `py-2`, `py-2.5`, `py-3`, `py-3.5`, `py-4` y `p-3` — **6 alturas distintas para el mismo elemento**.
- **12 valores inline en px** que rompen la escala: `padding: '2px 0'`, `padding: '14px 0'`, `marginBottom: '12px'`, `paddingLeft: '128px'`, `marginBottom: '6px'`…
- 3 arbitrarios en viewport units: `pt-[8vh]`, `pt-[20vh]`, `mt-[20vh]`.

> **97 utilidades sobre ~17 pasos. Deberían ser 8 pasos.**

#### e) Bordes y radios — **5 radios**

`rounded-full` (21×, casi todo en dots del carrusel y avatares), `rounded` (7×), `rounded-lg` (5×, solo admin), `rounded-none` (1×), `borderRadius: '0px'` (1×, Stripe appearance).

La estética es de esquina viva y eso es coherente. Los `rounded-lg` del admin son la excepción sin justificación.

**Bordes:** anchos consistentes (`border` = 1px casi siempre); el desorden está en el color (`border-gray-200` 97×, `border-black` 94×, `border-gray-300` 34×, `border-gray-100` 24×, `border-gray-400`, `border-gray-500`, `border-white`, 4 variantes de rojo).

> **5 radios. Deberían ser 2.**

#### f) Sombras — **4 valores**

`boxShadow: 'none'` (4×, todas en la config de Stripe), `shadow-xl` (1×), `shadow-2xl` (1×), `shadow` (1×).

Prácticamente no hay sombras — es un diseño plano y eso es intencional y correcto. Pero los 3 usos que existen son 3 escalas distintas en 3 componentes distintos, y los drawers (carrito, filtros, menú móvil) **no tienen sombra**, así que se despegan mal del contenido.

> **4 valores incoherentes. Deberían ser 2.**

---

### B2. Componentes duplicados

**El hallazgo principal: `components/common/` está muerto.**

```
components/common/Button.tsx   — 0 importaciones
components/common/Input.tsx    — 0 importaciones
components/common/Badge.tsx    — 0 importaciones
components/common/Spinner.tsx  — 0 importaciones
```

Búsqueda de `from '@/components/common` en todo `app/` y `components/`: **cero resultados**. Alguien construyó el sistema de diseño correcto —`Button` tiene variants, sizes, `fullWidth`, `loading`, `forwardRef`; `Input` genera `useId()` y asocia el `<label htmlFor>`— y después la app entera se escribió a mano ignorándolo.

#### Botones: **109 `<button>` crudos, 22 estilos visualmente distintos**

| Elemento | Estilo | Archivo |
|---|---|---|
| CTA "ADD TO BAG" | `w-full py-4 uppercase tracking-wide bg-black text-white hover:bg-gray-800` + inline `11px/800` | `ProductContent.tsx:315` |
| CTA "PAGAR" | `w-full bg-black text-white py-4 text--[12px] uppercase tracking-widest font-medium hover:bg-gray-900 disabled:bg-gray-200` | `checkout/page.tsx:215` |
| CTA "SHOP NOW" | `inline-block bg-black text-white px-12 py-4 text-xs` + inline `11px/800` | `page.tsx:28` |
| CTA carrito vacío | `bg-black text-white px-8 py-3 uppercase tracking-wide hover:bg-gray-800` | `cart/page.tsx:44` |
| CTA "Continuar comprando" | `block w-full border border-black text-black py-2.5 hover:bg-black hover:text-white` | `success/…/page.tsx:204` |
| Quick add (hover en card) | `absolute bottom-0 bg-black text-white py-3` + inline `11px/500` | `ProductCard.tsx:99` |
| Guardar (admin) | `bg-black text-white uppercase tracking-widest px-8 py-3 hover:bg-gray-800 disabled:opacity-50` | `ProductForm.tsx:68` |
| Login | `w-full bg-black text-white py-2.5 text-[11px] hover:opacity-75 disabled:opacity-50` | `LoginForm.tsx` |
| Sold out | `w-full bg-gray-200 text-gray-500 py-4 cursor-not-allowed` | `ProductContent.tsx:301` |

**Lo que difiere exactamente entre versiones del mismo botón primario negro:**

| Propiedad | Variantes en uso |
|---|---|
| Altura vertical | `py-2`, `py-2.5`, `py-3`, `py-3.5`, `py-4`, `p-3` — **6** |
| Hover | `hover:bg-gray-800`, `hover:bg-gray-900`, `hover:opacity-80`, `hover:opacity-75` — **4** |
| Disabled | `disabled:opacity-50`, `disabled:opacity-40`, `disabled:bg-gray-200 disabled:text-gray-400` — **3** |
| Tracking | `tracking-wide`, `tracking-widest`, inline `0.05em` — **3** |
| Tamaño de texto | `text-xs`, `text-[11px]`, `text-[12px]`, `text-sm`, inline `10px`, inline `11px` — **6** |
| Peso | 500, 800, `font-medium`, sin declarar — **4** |
| Transición | `transition-colors`, `transition-opacity`, `duration-150`, `duration-200`, sin duración — **5** |

**Ningún botón de la app tiene estado `:focus-visible`.** El `Button.tsx` muerto sí lo tiene.

#### Inputs: **89 inputs, ~8 estilos, 53 sin label**

| Estilo | Usos | Dónde |
|---|---|---|
| `w-full border-b border-gray-200 bg-transparent py-2.5 focus:border-black` | 6+3+2 | admin (ProductForm, BrandForm, PickupPointForm) |
| `w-full border border-gray-300 px-3 py-2.5 placeholder:text-gray-400 focus:border-black` | 6+3 | cuenta (Login, Register, Profile, Reset) |
| `w-full py-3.5 border-b border-gray-200 placeholder:text-gray-300 placeholder:text-[11px] text-sm` | 10+ | checkout (`INPUT` const, línea 236) |
| `w-full border border-gray-200 p-3 focus:border-black resize-none` | 2 | vender |

Tres familias de input incompatibles: **borde inferior** (admin), **caja completa** (cuenta) y **borde inferior con placeholder de 11px** (checkout). Y `htmlFor` aparece **5 veces** contra **53 inputs que solo tienen `placeholder`**.

#### Otros duplicados

| Componente | Estado |
|---|---|
| Tarjeta de producto | ✅ **Único bien centralizado** — `ProductCard.tsx`, usado vía `ProductGrid` |
| Precio | ❌ `formatPrice()` se comparte, pero el envoltorio `<p style={{fontFamily…, fontSize:'11px'}}>` está copiado en ProductCard, ProductContent, CartDrawer, checkout, success, orders |
| Etiqueta de talla | ❌ No existe componente. `ProductContent.tsx:214` la pinta a mano (y nunca se muestra — ver B4) |
| Badge | ❌ `Badge.tsx` sin usar; "NEW" está inline en `ProductCard.tsx:65`, "SOLD OUT" en `:80` |
| Micro-label mayúsculas | ❌ ~150 repeticiones del patrón `uppercase tracking-widest text-[10px] text-gray-400` sin componente |
| Encabezado de página | ❌ Cada pantalla lo escribe distinto (11px en colección, 13px en admin, 11px/600 en success) |
| Modal / Drawer | ❌ CartDrawer, SearchFilterDrawer, menú móvil del Header y CropModal: 4 implementaciones independientes de overlay+panel |
| Mensaje de error | ❌ `bg-red-50 border border-red-200 px-4 py-3` copiado en ProductForm, checkout (×2), y otras 3 variantes con `text-red-500`/`600`/`700` |
| Spinner | ❌ `Spinner.tsx` sin usar; `Button.tsx` tiene el suyo inline; el checkout no muestra ninguno |

---

### B3. Consistencia pantalla por pantalla

| Pantalla | Archivo | Ancho máx. | Padding lateral | Fondo | Tipografía | Rompe patrón |
|---|---|---|---|---|---|---|
| Home | `[locale]/page.tsx` | **ninguno** (full-bleed) | `px-8` | blanco | inline HN | Hero `py-32/48` |
| Listado | `collections/[category]/page.tsx` | **ninguno** | `px-4 md:px-8` | blanco | inline HN | — (referencia) |
| Ficha | `products/[slug]/ProductContent.tsx` | full-bleed, grid 2 col | `p-8 md:p-12` | galería `#F5F5F5` | inline HN | `pt-16` duplicado |
| Carrito | `(shop)/cart/page.tsx` | **ninguno** | `px-4 md:px-8` | blanco | inline HN | **`pt-14`** ≠ 16 |
| Checkout | `checkout/page.tsx` | **`max-w-7xl`** | `px-6 lg:px-8` | blanco | **clases TW, sin inline** | Otro sistema tipográfico |
| Confirmación | `success/[orderId]/page.tsx` | **`max-w-2xl`** | `px-6` | blanco | **inline con hex directos** (`#666`, `#999`) | Tercer sistema |
| Buscador visual | `visual-search/page.tsx` | **`max-w-md`** | `px-6` | blanco | inline HN | Centrado vertical |
| Login / Cuenta | `account/_components/LoginForm.tsx` | **`max-w-sm`** | `px-4` + card `px-8 py-10` | 🔴 **`bg-gray-100` + card `bg-gray-50`** | inline vía const `FONT` | **← "de otra app"** |
| Admin | `admin/layout.tsx` | ninguno | `px-10 py-8` | `#fafafa` + sidebar negro `w-60` | inline vía const `font` | (correcto, es otro producto) |

**Conclusiones:**

1. 🔴 **Login/Cuenta se ve como de otra app, y con razón.** Es la única zona de la tienda con **fondo gris** y una **tarjeta centrada**; todo el resto es blanco a sangre. Peor: `ClientLayout.tsx:41` **oculta el Header completo** en `/account` (`{!isAccount && <Header/>}`). El usuario aterriza en una pantalla gris, sin navegación y sin manera de volver a la tienda. Es la pantalla más rota del sistema.

2. 🟠 **Tres sistemas tipográficos coexisten.** Tienda (inline Helvetica Neue) · Checkout (clases Tailwind puras, ninguna declaración de familia → hereda la stack de *sistema*) · Confirmación (inline con hex crudos). Checkout y ficha, que son consecutivas, **están literalmente en fuentes distintas**.

3. 🟠 **`<main>` anidados.** `ClientLayout.tsx:43` ya emite `<main className="flex-1 pt-16">`, y luego `ProductContent.tsx:70` emite **otro** `<main className="flex-1 pt-16">` dentro, y `cart/page.tsx:28` otro con `pt-14`. Resultado: HTML inválido (dos landmarks `main`), **128 px de padding superior** en la ficha y 120 px en el carrito, donde debería haber 64.

4. 🟡 **Cuatro anchos máximos sin criterio:** ninguno (home, listado, carrito), `max-w-7xl` (checkout), `max-w-2xl` (confirmación), `max-w-md` (buscador), `max-w-sm` (login). En desktop el listado se estira a 2560px mientras el checkout se detiene en 1280.

5. 🟡 **Cinco paddings laterales:** `px-4`, `px-6`, `px-8`, `px-10`, `p-8`. En móvil la ficha usa `p-8` (32px) mientras el listado usa `px-4` (16px) — el contenido "salta" al navegar entre las dos.

---

### B4. Ficha de producto — la pantalla que convierte

Archivo: `app/[locale]/products/[slug]/ProductContent.tsx` (331 líneas).

**Jerarquía visual real, en móvil, de arriba abajo:**

1. **Foto** — `aspect-[3/4]`, ancho completo (línea 125). Lo primero, correcto. ✅
2. **Nombre** — 13px, peso 800, mayúsculas (línea 188).
3. **Precio** — **13px, peso 400** (línea 200). **El precio es del mismo tamaño que el nombre y más ligero.** El ojo no lo encuentra.
4. Nota de envío gratis — 10px, `#666`, mayúsculas.
5. `<details>` "DETALLES DEL PRODUCTO" — **colapsado por defecto** (línea 244).
6. Botón ADD TO BAG.

**Diagnóstico por punto:**

| Criterio | Estado |
|---|---|
| Tamaño de la foto en móvil | ✅ Full-width `3/4`. Correcto. |
| **¿Precio y botón visibles sin scroll?** | 🔴 **No.** La foto 3:4 ocupa ~500px de un viewport de 667px. Debajo empieza un contenedor con `p-8` (32px). El precio queda justo en el borde o debajo; **el botón de compra está garantizadamente fuera de pantalla**, después de la nota de envío y del acordeón. |
| **¿Cómo se presentan medidas, talla y estado?** | 🔴 **No se presentan.** Ver bug abajo. |
| ¿Un solo CTA? | ✅ Sí, `ADD TO BAG` es el único. Bien. Pero compite con los links "< VOLVER A" / "SIGUIENTE >" (solo desktop). |
| **Qué pasa cuando está vendida** | ⚠️ Botón gris `bg-gray-200 text-gray-500` con "SOLD OUT". Funciona, pero **el contraste es 2.8:1 — no cumple accesibilidad** y se lee como "deshabilitado por error", no como "esta pieza ya voló". Para segunda mano, "vendido" debería tener carga narrativa (es prueba social), no parecer un bug. |

#### 🔴 Bug: la talla nunca se muestra en toda la tienda

`ProductContent.tsx:212` condiciona el bloque de talla a `product.size`.
`ProductCard.tsx:105` hace lo mismo.

Pero **`lib/products.ts:66` (`rowToProductData`) nunca asigna `size`.** El objeto que retorna tiene `id, name, price, image, images, slug, description, category, soldOut, isNew, brand, attributes` — y nada más. `ProductData.size` y `ProductData.variants` están declarados en la interfaz (líneas 23-27) y **jamás se pueblan**. La tabla `product_variants` no se consulta en ningún archivo del proyecto.

**Consecuencia:** `product.size` es siempre `undefined`, así que ese bloque **nunca renderiza, ni en la ficha ni en la tarjeta**. En una tienda de segunda mano donde cada prenda es una talla única, **la talla es el primer dato que el cliente busca y no está en ninguna parte**.

Hoy el único vehículo es meterla a mano como `product_attributes` con key "Talla" — y esos atributos viven **dentro del acordeón colapsado**.

**Qué sobra en la ficha:**
- La navegación "< VOLVER A CATEGORÍA / SIGUIENTE >" (líneas 72-102) — 30 líneas para desktop, que es tu 5% de tráfico.
- El acordeón `<details>`: con 3 líneas de contenido, esconder no aporta nada y cuesta un clic.
- La nota de "envío gratis" es 🔴 **falsa** — el checkout cobra envío siempre (`checkout/actions.ts:140`). Estás prometiendo algo que no cumples en la pantalla siguiente.

**Qué falta:**
- **Talla, arriba, grande y visible** (bug de datos + posición).
- **Estado de la prenda** con etiqueta clara (Excelente / Muy bueno / Con señales de uso).
- **Medidas en cm** — en segunda mano sustituyen al probador. Sin ellas el cliente no compra o devuelve.
- **Notas de honestidad** sobre defectos. Genera confianza y baja devoluciones.
- **"Pieza única — solo hay una"** como mensaje explícito. Es tu propuesta de valor y tu motor de urgencia, y hoy no aparece en ningún lado.
- **Marca visible** — `product.brand` sí se carga (`lib/products.ts:77`) pero **la ficha nunca la renderiza**. Tienes el dato y lo tiras.
- **CTA fijo en el borde inferior** (`sticky bottom-0`) en móvil, con precio al lado.

---

### B5. Móvil a 375px

| Problema | Detalle |
|---|---|
| 🔴 **Texto <16px generalizado** | **566 declaraciones** entre 8 y 11px. El cuerpo de la tienda es 11px. En un 375px real esto se lee con esfuerzo. |
| 🔴 **Zoom automático en iOS** | Los inputs del checkout usan `text-sm` = 14px (`checkout/page.tsx:237`). **Safari iOS hace zoom en todo input <16px**: al tocar el primer campo la página salta y se descuadra el resto del formulario. |
| 🔴 **Áreas táctiles <44px** | Dots del carrusel `w-2 h-2` = **8px** (`ProductContent.tsx:150`); flechas `p-2` sobre un glifo de texto ≈ 28px (líneas 165, 174); checkboxes `w-3.5 h-3.5` = **14px** (`ProductForm.tsx:351`); botón × del uploader `w-4 h-4` = **16px**. |
| 🟠 **Elemento inalcanzable en móvil** | El "quick add" de `ProductCard.tsx:95` se muestra con `isHovered`. **En touch no existe hover.** El botón nunca aparece en el 95% de tu tráfico — código muerto en producción. |
| 🟠 **Padding superior duplicado** | `<main>` anidados → 128px de aire arriba en la ficha (ver B3.3). |
| 🟠 **Navegación a una mano** | El único CTA de compra está al final del scroll, sin `sticky`. El menú móvil abre `fixed inset-0` (`Header.tsx:804`) y el botón de cerrar está arriba, fuera del alcance del pulgar. |
| 🟡 **Teclados correctos** | ✅ `type="email"` y `type="tel"` bien puestos. ❌ **`zipCode` es `type="text"` sin `inputMode="numeric"`** (`checkout/page.tsx:727`) → abre teclado alfabético para meter 5 dígitos. En todo el repo hay **cero `inputMode`**. |
| 🟡 **`autoComplete`** | Solo en `email` (línea 655). Faltan `given-name`, `family-name`, `tel`, `postal-code`, `address-line1`, `address-level2` → el autocompletado del navegador no rellena nada y el cliente teclea 10 campos a mano en un teléfono. |

**Desbordamiento horizontal:** no encontré desbordes evidentes; el grid es `grid-cols-2` en móvil y las utilidades son responsive. El riesgo está en `Header.tsx:145` (`justify-between px-8` con logo + nav + bag) y en `min-w-[4rem]` de la línea 165 — verificar en dispositivo real.

---

### B6. Imágenes

| Criterio | Estado |
|---|---|
| Relación de aspecto en tarjetas | ✅ `aspect-[3/4]` fijo con `object-cover` (`ProductCard.tsx:47`). Consistente. |
| ¿Se deforman? | ✅ No. `object-cover` en todos los casos. |
| ¿Cambian de tamaño entre pantallas? | 🔴 **Sí.** Tarjeta = **3:4** · Ficha móvil = **3:4** · Ficha desktop = **`height: 100vh`** por foto (`ProductContent.tsx:111`). En desktop cada imagen se recorta a la altura del viewport, así que **el encuadre cambia según el monitor** — en una pantalla ancha recorta la prenda por los lados. Y tus fotos del Studio se generan en **4:5** (`IG_POST_WIDTH/HEIGHT`), que no coincide con el 3:4 de la tarjeta: **cada foto se recorta en el catálogo**. |
| **Placeholder mientras cargan** | 🔴 **No existe.** Ningún `<Image>` usa `placeholder="blur"` ni `blurDataURL`. Solo hay un `<div className="bg-[#EBEBEB]">` para el caso de *no haber* imagen (`ProductCard.tsx:60`). En 4G el usuario ve rectángulos vacíos. |
| **Ver la foto en grande** | 🔴 **No hay zoom ni lightbox.** En segunda mano, poder acercarse a una costura o a una mancha es la diferencia entre comprar y no comprar. |
| Galería móvil | ⚠️ Carrusel por `translateX` con botones `<`/`>` y dots — **sin gestos de swipe**. En móvil se navegan fotos con flechas de 28px. |
| `sizes` / srcset | 🔴 Falta en la ficha (ver A7) |

---

### B7. Estados faltantes

| Estado | ¿Existe? | Dónde / qué falta |
|---|---|---|
| **Carga (ruta)** | 🔴 **No** | **Cero `loading.tsx` en todo `app/`.** Ninguna transición tiene feedback. |
| Carga (acción) | ⚠️ Parcial | `isAdding` en ficha, `pending` en forms admin, `isConfirming` en checkout. Cada uno lo resuelve distinto y `Spinner.tsx` sigue sin usarse. |
| **Vacío — sin prendas** | ⚠️ Existe pero roto | `ProductGrid.tsx:31` → **"No products available" hardcodeado en inglés** en una tienda cuyo idioma por defecto es español. Sin ilustración ni CTA. |
| Vacío — carrito | ✅ | `cart/page.tsx:34` con título, subtítulo y CTA. **El mejor estado vacío del repo — úsalo de referencia.** |
| Vacío — búsqueda / wishlist | ✅ | Traducidos, con copy |
| **Error (ruta)** | ⚠️ Solo global | `app/error.tsx` y `app/not-found.tsx` existen. **No hay `error.tsx` por segmento** — si falla la ficha, cae el error global genérico. |
| Error (formulario) | ⚠️ | Existe en checkout y admin, pero con **4 estilos distintos** (ver B2) |
| **Éxito tras compra** | ⚠️ Existe, **incorrecto** | Dice "confirmado" sin verificar el pago (S3) |
| Prenda agotada | ⚠️ | Botón gris con contraste 2.8:1 (ver B4) |
| **`:hover`** | ✅ Presente | ~200 usos, pero con 4 tratamientos distintos |
| **`:focus` / `:focus-visible`** | 🔴 **Ausente en botones** | Búsqueda de `focus-visible`: **solo 1 resultado, en el `Button.tsx` muerto**. Los inputs sí tienen `focus:border-black`. **Los 109 botones de la app no tienen ningún indicador de foco.** |
| `:disabled` | ⚠️ | 3 tratamientos distintos |
| **Offline / fallo de red** | 🔴 No | El buscador visual muestra error crudo sin reintento |

---

### B8. Accesibilidad básica

**Contraste (WCAG AA = 4.5:1 para texto normal):**

| Combinación | Ratio | ¿Pasa? | Usos |
|---|---|---|---|
| `#000` sobre `#fff` | 21:1 | ✅ | — |
| `#666` sobre `#fff` | 5.74:1 | ✅ | 100 |
| **`#999` sobre `#fff`** | **2.85:1** | 🔴 **No** | 21 |
| **`text-gray-400` (`#9ca3af`) sobre `#fff`** | **2.54:1** | 🔴 **No** | **120** |
| **`text-gray-300` (`#d1d5db`) sobre `#fff`** | **1.47:1** | 🔴 **No** | 28 |
| **`text-gray-500` sobre `#fff`** | 4.83:1 | ✅ (justo) | 37 |
| **`text-gray-500` sobre `bg-gray-200`** (botón sold out) | **2.8:1** | 🔴 **No** | ficha |
| `text-red-500` sobre `#fff` | 3.76:1 | 🔴 No | 24 (errores) |

**~170 usos de texto fallan el contraste mínimo**, y no son decorativos: `text-gray-400` es el color de las etiquetas de campo del checkout, de los placeholders y de los micro-labels de toda la tienda. Combinado con 10px de tamaño, **una parte real de tu interfaz es ilegible bajo el sol en un teléfono**, que es exactamente el contexto de alguien navegando desde Instagram.

**Imágenes sin alt:** 19 atributos `alt` para 14 `<Image>` + varios `<img>`. **6 con `alt=""`** (`ImageUploader.tsx:63,91`, `CropModal.tsx:172`, `StudioWorkspace.tsx:540,803`, `StyleRefsManager.tsx:59`) — todas en el admin, donde el `alt` vacío es defendible. En la tienda los alt existen y son descriptivos (`ProductCard.tsx:52`, `ProductContent.tsx:114`). ✅

**Inputs sin label:** 🔴 **89 inputs, 5 `htmlFor`, 53 solo con `placeholder`.** Los 10 campos del checkout son placeholder-only (`checkout/page.tsx:718-793`): el lector de pantalla no anuncia nada útil, y —más grave para conversión— **al empezar a escribir el placeholder desaparece y el usuario ya no sabe qué campo está llenando**. En un formulario de 10 campos en móvil eso genera errores reales.

**Navegación por teclado:** 🔴 Los botones son `<button>` nativos (bien, son enfocables), pero **sin `:focus-visible` no se ve dónde está el foco**. No hay "saltar al contenido". Los drawers (`CartDrawer`, `SearchFilterDrawer`, menú móvil) **no atrapan el foco** ni cierran con `Escape` — al abrir el carrito, el tab sigue recorriendo la página de atrás.

**`aria`:** `aria-label` presente en los controles del carrusel (`ProductContent.tsx:153,167,176`) ✅. `role="status"` en el Spinner muerto. Los drawers no declaran `role="dialog"` ni `aria-modal`.

---

## 2. DIAGNÓSTICO DE DISEÑO EN NÚMEROS

| Categoría | Hay | Deberían ser | Exceso |
|---|---|---|---|
| **Colores (total)** | **67** | **7** | **9.6×** |
| — grises casi idénticos | 19 | 3 | 6.3× |
| — hex | 19 | 6 | |
| — rgba | 10 | 2 | |
| — utilidades Tailwind de color | 38 | 0 (vía tokens) | |
| **Tamaños de texto** | **18** | **5** | **3.6×** |
| — declaraciones por debajo de 12px | 566 | 0 | ∞ |
| **Stacks tipográficos** | **3** | **1** | 3× |
| — pesos usados | 6 (uno sin cargar) | 3 | 2× |
| — fuentes descargadas sin uso público | 1 (Bebas) | 0 | |
| **Espaciados (utilidades únicas)** | **97** | **8 pasos** | 12× |
| — valores inline en px fuera de escala | 12 | 0 | |
| — alturas del mismo botón primario | 6 | 1 | 6× |
| **Radios** | **5** | **2** | 2.5× |
| **Sombras** | **4** | **2** | 2× |
| **Letter-spacing** | **7** | **2** | 3.5× |
| **Estilos de botón** | **22** | **3** (primario/secundario/texto) | 7.3× |
| **Estilos de input** | **8** | **1** | 8× |
| **Anchos máximos de contenido** | **5** | **2** | 2.5× |
| **Paddings laterales de página** | **5** | **1** (responsive) | 5× |
| **Declaraciones tipográficas inline** | **152** | **0** | ∞ |
| **`<button>` crudos** | **109** | **0** | ∞ |
| **Componentes compartidos existentes usados** | **0 de 4** | 4 de 4 | — |

**La cifra que resume el diagnóstico: 152 declaraciones inline de `fontFamily` y 109 `<button>` escritos a mano, mientras `components/common/Button.tsx` existe, está bien hecho y tiene cero importaciones.** El problema no es que falte sistema. Es que se construyó y nunca se conectó.

---

## 3. PROPUESTA DE TOKENS

Derivados de lo que ya existe. Ninguna estética nueva: negro sobre blanco, esquina viva, mayúsculas espaciadas, plano. Los valores son provisionales — al cerrar la identidad de marca solo cambian estas variables, no el código.

**Dos decisiones que sí cambian valores actuales, y por qué:**
1. **`--t-body` es 14px, no 11px.** Mantener 11px como texto de lectura no es defendible en móvil. El 11px se conserva como `--t-micro` para los labels en mayúsculas, que es donde funciona.
2. **`--c-ink-faint` es `#767676`, no `#999`.** `#999` da 2.85:1 y es ilegible. `#767676` es el gris más claro que pasa 4.5:1 sobre blanco, y visualmente es casi el mismo tono. Es un cambio de un dígito con un impacto real.

```css
/* app/globals.css — reemplaza el bloque :root actual (líneas 8-12) */

:root {
  /* ── COLOR ─────────────────────────────────────────────────────────
     6 roles + 1 estado. Todo gris del repo colapsa aquí.             */
  --c-ink:          #000000;  /* texto principal, botón primario, bordes de énfasis */
  --c-surface:      #ffffff;  /* fondo de página                                     */
  --c-ink-muted:    #666666;  /* texto secundario — descripciones, totales           */
  --c-ink-faint:    #767676;  /* labels, metadatos — MÍNIMO legible (4.54:1)         */
  --c-line:         #e5e5e5;  /* todos los bordes y divisores                        */
  --c-surface-alt:  #f5f5f5;  /* fondo de foto, filas de resumen, zonas inertes       */
  --c-danger:       #c81e1e;  /* errores — 5.9:1 (el #ef4444 actual da 3.76:1)        */

  /* Derivados — no son tokens nuevos, son estados del mismo color */
  --c-ink-hover:    #333333;  /* unifica hover:bg-gray-800 / gray-900 / opacity-*     */
  --c-disabled-bg:  #e5e5e5;
  --c-disabled-fg:  #767676;  /* sold-out ahora da 4.5:1, antes 2.8:1                 */

  /* ── TIPOGRAFÍA ────────────────────────────────────────────────────
     Una sola stack. Inter primero: se carga vía next/font, así que
     renderiza igual en iPhone y Android. Fin de las dos tipografías. */
  --f-sans: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;

  --fw-regular: 400;
  --fw-medium:  500;
  --fw-bold:    700;   /* sustituye el 800 sintético; 700 SÍ se carga */

  /* 5 tamaños. Todo lo demás colapsa aquí.                           */
  --t-micro:   0.6875rem; /* 11px — labels UPPERCASE, badges, chrome  */
  --t-body:    0.875rem;  /* 14px — texto corrido, precio en tarjeta  */
  --t-lead:    1rem;      /* 16px — precio en ficha, INPUTS (sin zoom iOS) */
  --t-title:   1.5rem;    /* 24px — encabezados de sección            */
  --t-display: 3rem;      /* 48px — hero                              */

  --lh-tight: 1.2;
  --lh-body:  1.6;

  --ls-normal: 0.01em;
  --ls-caps:   0.1em;   /* único tracking para mayúsculas; unifica 7 valores */

  /* ── ESPACIADO — escala de 4 ───────────────────────────────────── */
  --s-1:  0.25rem;  /*  4px */
  --s-2:  0.5rem;   /*  8px */
  --s-3:  0.75rem;  /* 12px */
  --s-4:  1rem;     /* 16px */
  --s-6:  1.5rem;   /* 24px */
  --s-8:  2rem;     /* 32px */
  --s-12: 3rem;     /* 48px */
  --s-16: 4rem;     /* 64px */

  /* ── FORMA ─────────────────────────────────────────────────────── */
  --r-none: 0;        /* por defecto — la estética es esquina viva */
  --r-full: 9999px;   /* dots, avatares, pills */

  --b-hairline: 1px solid var(--c-line);
  --b-strong:   1px solid var(--c-ink);

  /* ── ELEVACIÓN ─────────────────────────────────────────────────── */
  --sh-raised:  0 1px 2px rgba(0,0,0,0.08);   /* del rgba(0,0,0,0.08) ya usado 12× */
  --sh-overlay: 0 8px 32px rgba(0,0,0,0.12);  /* drawers y modales */

  /* ── LAYOUT ────────────────────────────────────────────────────── */
  --w-content: 1280px;  /* max-w-7xl, ya usado en checkout */
  --w-narrow:  640px;   /* formularios y confirmación */
  --pad-page:  var(--s-4);
  --h-header:  3.5rem;  /* 56px = h-14 real del Header */
  --tap-min:   2.75rem; /* 44px — área táctil mínima */
}

@media (min-width: 768px) {
  :root {
    --pad-page:  var(--s-8);
    --t-display: 4.5rem;  /* 72px */
    --t-title:   2rem;    /* 32px */
  }
}
```

**Y en `tailwind.config.ts`,** para poder usarlos como utilidades sin reescribir todo a CSS plano:

```ts
theme: {
  extend: {
    colors: {
      ink:      'var(--c-ink)',
      'ink-muted': 'var(--c-ink-muted)',
      'ink-faint': 'var(--c-ink-faint)',
      surface:  'var(--c-surface)',
      'surface-alt': 'var(--c-surface-alt)',
      line:     'var(--c-line)',
      danger:   'var(--c-danger)',
    },
    fontSize: {
      micro:   ['var(--t-micro)',   { lineHeight: 'var(--lh-tight)' }],
      body:    ['var(--t-body)',    { lineHeight: 'var(--lh-body)'  }],
      lead:    ['var(--t-lead)',    { lineHeight: 'var(--lh-body)'  }],
      title:   ['var(--t-title)',   { lineHeight: 'var(--lh-tight)' }],
      display: ['var(--t-display)', { lineHeight: 'var(--lh-tight)' }],
    },
    fontFamily: { sans: 'var(--f-sans)' },
    letterSpacing: { caps: 'var(--ls-caps)' },
    boxShadow: { raised: 'var(--sh-raised)', overlay: 'var(--sh-overlay)' },
    maxWidth: { content: 'var(--w-content)', narrow: 'var(--w-narrow)' },
  },
}
```

Con esto `text-micro`, `text-ink-faint`, `tracking-caps`, `max-w-content` quedan disponibles como clases normales, y la migración es un find-replace en vez de una reescritura.

---

## 4. MAPA DE MIGRACIÓN

### Colores

| Valor actual | Usos | → Token | Archivos principales |
|---|---|---|---|
| `#000`, `#000000`, `text-black`, `bg-black`, `border-black` | 111+6+123+69+94 | `--c-ink` | transversal |
| `#fff`, `#ffffff`, `text-white`, `bg-white` | 1+7+78+61 | `--c-surface` | transversal |
| `#666`, `text-gray-600` | 100+9 | `--c-ink-muted` | ProductContent, success, checkout |
| `#999`, `#9ca3af`, `text-gray-400`, `text-gray-500` | 21+2+120+37 | `--c-ink-faint` | **transversal — mayor ganancia de contraste** |
| `text-gray-300`, `text-gray-200` | 28+3 | `--c-ink-faint` | LoginForm:81, checkout:865 |
| `#e5e7eb`, `#ebebeb`, `border-gray-100/200/300/400/500` | 2+1+24+97+34+2+1 | `--c-line` | transversal |
| `#f5f5f5`, `#fafafa`, `bg-gray-50/100` | 5+1+19+19 | `--c-surface-alt` | ProductCard:47, ProductContent:106, admin/layout:14 |
| `bg-gray-800`, `bg-gray-900` (hovers) | 16+5 | `--c-ink-hover` | los 22 botones |
| `bg-gray-200` + `text-gray-500` (sold out) | 7 | `--c-disabled-bg` / `--c-disabled-fg` | ProductContent:301 |
| `#ef4444`, `text-red-500/600/700`, `border-red-200`, `bg-red-50` | 1+24+10+2+5+5 | `--c-danger` (+ 10% alpha para fondo) | checkout:206, ProductForm:362 |
| `rgba(0,0,0,0.8)` (×51) | 51 | `--c-ink` + `opacity` | Header (text-shadow decorativo) |
| `rgba(0,0,0,0.08)` (×12) | 12 | `--sh-raised` | transversal |
| `#4285f4`, `#ea4335`, `#fbbc05`, `#34a853` | 8 | **conservar** (logo Google) | LoginForm |

### Tipografía

| Valor actual | Usos | → Token |
|---|---|---|
| `fontSize: '8px' / '9px' / '10px' / '11px'`, `text-[9px]/[10px]/[11px]`, `text-xs` | **566** | `--t-micro` (11px) |
| `fontSize: '12px' / '13px' / '15px'`, `text-[12px]/[15px]`, `text-sm` | 64 | `--t-body` (14px) |
| `fontSize: '16px' / '18px'`, `text-base`, `text-lg` | 19 | `--t-lead` (16px) |
| `fontSize: '28px' / '32px'`, `text-xl`/`2xl`/`3xl` | 8 | `--t-title` (24/32px) |
| `fontSize: '48px'`, `text-6xl`, `text-8xl` | 3 | `--t-display` |
| **`fontFamily: "'Helvetica Neue', 'Inter', …"`** | **152** | **borrar la línea** — hereda `--f-sans` del `body` |
| `fontWeight: 200 / 300 / 400` | 13 | `--fw-regular` |
| `fontWeight: 500 / 600`, `font-medium` | 151 | `--fw-medium` |
| **`fontWeight: 800`** (bold sintético) | **44** | `--fw-bold` (700, sí cargado) |
| `letterSpacing: 0.02/0.03/0.05/0.08/0.1em`, `tracking-wide/wider/widest` | 447 | `--ls-caps` en mayúsculas, `--ls-normal` en el resto |
| `@import` de Bebas Neue (`globals.css:2`) | 1 | **eliminar del bundle público**; cargar solo en `app/admin/layout.tsx` |
| `@import` de Inter (`globals.css:1`) | 1 | **reemplazar por `next/font/google`** en `[locale]/layout.tsx` |

### Espaciado, forma y layout

| Valor actual | → Token | Archivo:línea |
|---|---|---|
| `py-2 / 2.5 / 3 / 3.5 / 4`, `p-3` en botones | `--s-3` vertical (unificado) | los 22 botones |
| `padding: '2px 0'`, `'14px 0'`, `paddingLeft: '32px' / '128px'`, `marginBottom: '6px' / '8px' / '12px'` | pasos `--s-*` | ImageUploader:67, checkout:50, Header |
| `pt-[8vh]`, `pt-[20vh]`, `mt-[20vh]` | `--s-16` | visual-search |
| `px-4 / px-6 / px-8 / px-10 / p-8` (contenedores) | `--pad-page` | home:15,42 · collections:32 · cart:60 · checkout:586 · admin:14 |
| `max-w-7xl` | `--w-content` | checkout:586, wishlist:54 |
| `max-w-2xl`, `max-w-3xl`, `max-w-4xl`, `max-w-md`, `max-w-sm`, `max-w-xl`, `max-w-xs` | `--w-narrow` | success:94, visual-search:192, LoginForm:48 |
| `pt-16` duplicado + `pt-14` | **borrar de las páginas** — solo `ClientLayout` lo aplica | ProductContent:70, cart:28,59 |
| `rounded`, `rounded-lg` | `--r-none` (o `--r-full` si es pill) | admin (5×) |
| `shadow`, `shadow-xl`, `shadow-2xl` | `--sh-raised` / `--sh-overlay` | 3 archivos |
| `h-14` del Header vs `pt-16` del main | `--h-header` en ambos | Header:145, ClientLayout:43 |

**Orden de ejecución sugerido** (cada paso es verificable por separado):
1. Añadir tokens a `globals.css` + `tailwind.config.ts`. **No rompe nada** — nadie los usa todavía. *(1 h)*
2. Migrar `next/font`, borrar los dos `@import`, poner `--f-sans` en `body`. *(1 h)*
3. **Borrar las 152 líneas `fontFamily:` inline.** Find-replace masivo; el `body` ya provee la familia. **Es el paso de mayor impacto visual por hora invertida.** *(2 h)*
4. Reemplazar `fontSize` inline y `text-[Npx]` por las 5 clases nuevas. *(3 h)*
5. Sustituir colores por las utilidades tokenizadas. *(3 h)*
6. Crear los componentes de §5 y reemplazar uso por uso. *(ver §5)*

---

## 5. COMPONENTES A CREAR

Ordenados por frecuencia de uso — o sea, por cuánta duplicación eliminan.

| # | Componente | Reemplaza | Ubicación | Esfuerzo |
|---|---|---|---|---|
| 1 | **`<Button>`** — variants `primary`/`secondary`/`ghost`, sizes `sm`/`md`/`lg`, `fullWidth`, `loading`, `disabled`, **`focus-visible`**, `min-height: var(--tap-min)` | **109 `<button>` crudos, 22 estilos** | 🟢 **Ya existe** `components/common/Button.tsx` — actualizar a tokens y **adoptarlo** | 3 h |
| 2 | **`<Text>` / clases utilitarias** (`.t-micro`, `.t-body`, `.t-lead`, `.t-title`, `.t-display`, `.t-caps`) | **152 `fontFamily` + 566 `fontSize` inline** | `globals.css` `@layer components` | 2 h |
| 3 | **`<Field>`** — label visible asociada con `useId()`, `error`, `hint`, `inputMode`, `autoComplete`, tamaño 16px | **89 inputs, 8 estilos, 53 sin label** | 🟢 **Ya existe** `components/common/Input.tsx` — extender y adoptar | 3 h |
| 4 | **`<PageShell>`** — `max-width` + `--pad-page` + espaciado superior, un solo `<main>` | **5 anchos, 5 paddings, `<main>` anidados** | `components/layout/PageShell.tsx` | 2 h |
| 5 | **`<Price>`** — `formatPrice` + tamaño y peso por variante (`card`/`detail`/`summary`) | ~15 envoltorios copiados | `components/Price.tsx` | 1 h |
| 6 | **`<Label>`** (micro-label en mayúsculas) | ~150 repeticiones de `uppercase tracking-widest text-[10px] text-gray-400` | `components/common/Label.tsx` | 1 h |
| 7 | **`<EmptyState>`** — icono/título/subtítulo/CTA, traducido | 6 estados vacíos a mano, uno en inglés | `components/common/EmptyState.tsx` | 1.5 h |
| 8 | **`<Alert>`** — `error`/`success`/`info` | 4 estilos distintos de mensaje de error | `components/common/Alert.tsx` | 1 h |
| 9 | **`<Drawer>`** — overlay, `role="dialog"`, focus trap, cierre con `Escape`, `--sh-overlay` | CartDrawer + SearchFilterDrawer + menú móvil + CropModal | `components/common/Drawer.tsx` | 3 h |
| 10 | **`<ProductMeta>`** — talla, condición, medidas y notas de honestidad, **visible sin acordeón** | 🆕 No existe. **Es el componente que te falta para vender segunda mano.** | `components/ProductMeta.tsx` | 3 h |
| 11 | **`<Gallery>`** — swipe táctil, `placeholder="blur"`, zoom/lightbox, aspecto consistente | Carrusel a mano en `ProductContent.tsx:104-183` | `components/Gallery.tsx` | 4 h |
| 12 | **`<Badge>`** — NEW / SOLD OUT / PIEZA ÚNICA | 🟢 **Ya existe** sin usar | adoptar | 0.5 h |

**Total: ~25 h.** Tres de los doce ya están escritos y solo hay que conectarlos.

---

## 6. PLAN PRIORIZADO

Ordenado por **impacto ÷ esfuerzo**, no por severidad técnica.

### 🔴 BLOQUEANTES DE LANZAMIENTO — rompe dinero o confianza

*Sin estos, cada venta es una pérdida potencial o una promesa incumplida.*

| # | Qué | Archivo:línea | Horas | Impacto |
|---|---|---|---|---|
| **1** | **Envío a $10 MXN → tarifa real** | `lib/constants.ts:24-26` | **0.25** | **~$150 MXN por pedido. ~$1,050 en las primeras 7 ventas.** Mejor retorno absoluto del informe. |
| **2** | **Open Graph en la ficha** + `metadataBase` | `products/[slug]/page.tsx` (nuevo `generateMetadata`), `app/layout.tsx` | **2** | **Es el 95% de tu tráfico.** Sin esto, cada link compartido es un rectángulo gris. |
| **3** | **Control de stock: reserva atómica** — migración `0010` + RPC + llamada en checkout + liberación en webhook + cron de expiración | `0010_*.sql` (nuevo), `checkout/actions.ts:110`, `webhooks/stripe/route.ts:59` | **4** | **Impide vender dos veces la misma prenda.** El bug más caro posible. |
| **4** | **Stripe a producción** — claves live, webhook live, `automatic_payment_methods`, SPEI + OXXO, ampliar el `check` de `payment_method` | `.env`, `checkout/actions.ts:220`, `0001` (alter check) | **4** | **Sin esto no cobras.** OXXO+SPEI ≈ 40% de los pagos e-commerce en México. |
| **5** | **IDOR — fuga de datos de clientes** — eliminar `getGuestOrderByPaymentIntent` o exigir token | `lib/orders.ts:110`, `success/[orderId]/page.tsx:56` | **1** | Email, dirección y `guest_token` de cualquier cliente expuestos sin autenticación. |
| **6** | **"Pedido Confirmado" sin pago verificado** — condicionar a `payment_status`, borrar el fallback optimista | `success/[orderId]/page.tsx:62,106` | **1** | Confianza. Hoy dices "pago registrado" sin haber leído la base de datos. |
| **7** | **Rotar `ADMIN_SECRET`** a 32+ bytes aleatorios | `.env` (prod y local) | **0.25** | Firma la sesión de admin y todos los `guest_token`. |
| **8** | **Talla visible** — poblar `size` en `rowToProductData` desde `product_attributes` o `product_variants` | `lib/products.ts:66` | **1.5** | El dato #1 que busca un comprador de segunda mano. **Hoy no aparece en ninguna parte.** |
| **9** | **IVA incluido en vez de sumado** | `checkout/actions.ts:147`, `success/…:177` | **1** | Elimina el salto de precio de +16% en la última pantalla. |
| **10** | **Quitar la promesa falsa de envío gratis** | `ProductContent.tsx:239` | **0.1** | Prometes algo que el checkout no cumple. |
| **11** | **Pickup: desactivar o dejar solo puntos reales** | `0001:371` (seed), `checkout/page.tsx:797` | **0.5** | 8 tiendas ficticias con direcciones reales en el selector. |
| **12** | **`npm audit fix`** (nanoid, ws, protobufjs — sin breaking) | `package.json` | **0.25** | 6 CVEs high cerrados. |
| | **TOTAL BLOQUEANTES** | | **~16 h** | **Alcanzable en 7 días.** |

---

### 🟠 CRÍTICOS SEMANA 1 — no bloquea, pero cuesta ventas

| # | Qué | Archivo:línea | Horas | Impacto |
|---|---|---|---|---|
| **13** | **CTA `sticky` abajo en la ficha, con precio** | `ProductContent.tsx:296` | **1.5** | El botón de compra hoy está fuera de pantalla en móvil. Directo sobre conversión. |
| **14** | **Reducir el hero de la home** (`py-32/48` → `py-12`) | `page.tsx:15` | **0.25** | Sube la primera prenda por encima del fold. |
| **15** | **Jerarquía de la ficha** — precio a `--t-lead`, abrir el acordeón, mostrar la marca (ya está en los datos) | `ProductContent.tsx:188-291` | **2** | El precio hoy es del mismo tamaño que el nombre y más ligero. |
| **16** | **`<ProductMeta>`: condición + medidas + notas** (migración `0011` + campos en el admin + render) | nuevo + `0011_*.sql` + `ProductForm.tsx` | **5** | **Sustituye al probador.** Sin medidas, en segunda mano no se compra o se devuelve. |
| **17** | **Inputs a 16px + `inputMode` + `autoComplete`** | `checkout/page.tsx:237,718-793` | **1.5** | Elimina el zoom de iOS y activa el autocompletado en los 10 campos. |
| **18** | **Labels visibles en el checkout** (adoptar `Input.tsx`) | `checkout/page.tsx:718-793` | **2** | 10 campos placeholder-only: el usuario pierde el contexto al escribir. |
| **19** | **Contraste: `#999`/`gray-400`/`gray-300` → `--c-ink-faint`** | transversal (~170 usos) | **1.5** | Legibilidad real bajo sol en móvil. |
| **20** | **Un solo `<main>`** — borrar `pt-16`/`pt-14` de las páginas | `ProductContent.tsx:70`, `cart:28,59` | **0.5** | Quita 64px de aire muerto arriba de la ficha. |
| **21** | **Header en SSR** (quitar el gate de `mounted`) | `ClientLayout.tsx:29` | **1** | Elimina el CLS de cada carga. |
| **22** | **`next/font`** + borrar Bebas del bundle público | `globals.css:1-2`, `[locale]/layout.tsx` | **1** | Fin de las dos tipografías por dispositivo. Menos render-blocking. |
| **23** | **Header en `/account`** + fondo blanco (dejar de parecer otra app) | `ClientLayout.tsx:41`, `LoginForm.tsx:47` | **1** | Hoy el usuario aterriza sin navegación y sin salida. |
| **24** | **Marcar vendido en 1 clic** (reusar el patrón de `ToggleButton.tsx`) | `admin/products/page.tsx` | **1.5** | De 5 pasos a 1. Velocidad operativa diaria. |
| **25** | **Comprimir imágenes en la subida** (`sharp`, redimensionar a 1600px + WebP) | `admin/products/actions.ts:161` | **2** | 18 MB → ~1.5 MB por prenda. Subida desde móvil viable. |
| **26** | **`placeholder="blur"` + `sizes` en la ficha** | `ProductContent.tsx:112,132` | **1** | Sin rectángulos vacíos en 4G. |
| **27** | **Validación con Zod en el checkout** | `checkout/actions.ts:74` | **2** | Cierra S4. |
| **28** | **Cabeceras de seguridad + proteger `/api/dev/*`** | `next.config.js`, mover la ruta bajo `/api/admin` | **1** | Cierra S9 y S10. |
| **29** | **Auto-embedding al publicar** (llamar al pipeline en `createProduct`) | `admin/products/actions.ts:48` | **2** | Sin esto tus 7 prendas son invisibles al buscador visual. |
| **30** | **Traducir el estado vacío del grid** | `ProductGrid.tsx:31` | **0.25** | "No products available" en una tienda en español. |
| **31** | **`focus-visible` en botones** (viene gratis al adoptar `Button.tsx`) | transversal | **0.5** | Navegación por teclado hoy invisible. |
| | **TOTAL CRÍTICOS** | | **~31 h** | |

---

### 🟡 MEJORAS POSTERIORES

| Qué | Horas | Impacto |
|---|---|---|
| **Migración completa a tokens** (§4, pasos 1-5) | 10 | Base para poder cambiar la identidad de marca tocando 30 variables |
| **Componentes 4-12 de §5** | 18 | Elimina la duplicación estructural |
| **Buscador visual al frente en la home** (con `capture="environment"`) | 3 | Tu diferenciador, hoy a 3 clics de profundidad y sin nombre |
| **Galería con swipe + zoom/lightbox** | 4 | Ver la costura y el defecto de cerca = decisión de compra |
| **Reducir el checkout de 10 a 6 campos** | 2 | Menos abandono |
| **Reportes en el admin**: costo de adquisición, margen, días en inventario, por prenda y por drop | 6 | Hoy operas a ciegas sobre tu rentabilidad |
| **Duplicar prenda** en el admin | 2 | Publicación de piezas similares |
| **`loading.tsx` por segmento** | 1.5 | Feedback en cada navegación |
| **Focus trap + `Escape` en drawers** | 2 | Accesibilidad real |
| **Rate limit distribuido** (Upstash/Vercel KV) | 2 | Cierra S5; la API ya está lista para el swap |
| **`sitemap.xml` + `robots.txt` + Schema.org `Product`** | 2 | SEO orgánico a mediano plazo |
| **Caché de embeddings del buscador** (hash de imagen) | 2 | Costo y latencia |
| **Fallback del buscador visual a búsqueda por texto** | 2 | Hoy si Gemini falla, el usuario se queda sin nada |
| **Aspecto unificado 4:5** entre Studio, tarjeta y ficha | 2 | Fin del recorte de tus propias fotos |
| **`drops` como entidad real** | 4 | Hoy están hardcodeados en `archive/` |

### ⚪ DEUDA TÉCNICA — documentar y dejar quieta

| Qué | Por qué se deja |
|---|---|
| **`next@14` → `16`** (21 CVEs) | Breaking change mayor. Documentar el riesgo, planear para después del lanzamiento. Ningún CVE es explotable trivialmente en tu superficie. |
| **`product_variants` sin usar** (7 columnas) | La pieza única no la necesita. Dejar para una futura fase multi-talla. Documentar que **no es la fuente de verdad**. |
| **`promo_codes` sin usar** (tabla completa) | Fase 2 declarada. No estorba. |
| **`wishlist_items` en DB vs. localStorage** | Dos fuentes de verdad. Elegir una cuando la wishlist importe. |
| **`types/product.ts` huérfano** (`Product`, `ProductReview`, `stock`) | Dos modelos de producto en paralelo. Confunde a cualquiera que llegue. **Documentar que `ProductData` es el real.** |
| **`orders.exchange_rate`, `cfdi_*`, `invoice_requested`** | Facturación no implementada. Columnas inertes. |
| **`orders_insert_any` con `with check (true)`** | No explotable hoy (todo va por service role). Revocar cuando se toque RLS. |
| **`getProducts()` completo en la ficha** | Irrelevante con 7 prendas. **Revisar a las ~50.** |
| **`checkout/page.tsx` de 1,080 líneas** | Funciona. Dividir cuando haya que tocarlo, no antes. |
| **Doble rate limit en visual-search** (5/min y 10/min) | Contradictorio pero no dañino. Unificar al migrar a KV. |
| **`CLAUDE.md` desactualizado** | ⚠️ Esta sí conviene arreglarla pronto (30 min): describe un proyecto que ya no existe y va a desorientar a cualquiera que trabaje aquí. |

---

## RESUMEN DE ESFUERZO

| Cubeta | Horas | ¿En 7 días? |
|---|---|---|
| 🔴 Bloqueantes | **~16 h** | ✅ Sí |
| 🟠 Críticos semana 1 | ~31 h | Parcial — prioriza #13, #14, #15, #16, #17 (~10 h) |
| 🟡 Mejoras posteriores | ~63 h | No |
| ⚪ Deuda técnica | — | Documentar |

**Recomendación:** dedica los 7 días a los **16 h de bloqueantes** más los **~10 h de ficha de producto y móvil** (#13-#17). Son 26 horas de trabajo dirigido a las dos pantallas donde se decide la compra. Lanza con eso.

El sistema de tokens no es lo que te impide lanzar — y como los tokens se derivan de lo que ya existe, migrarlos después no rompe nada ni te obliga a rehacer el trabajo cuando cierres la identidad de marca.

**Lo que no debes hacer es abrir el checkout sin el punto 3.** Vender dos veces la misma prenda en tu primera semana, frente a una audiencia de Instagram que te está conociendo, cuesta mucho más que una semana de retraso.
