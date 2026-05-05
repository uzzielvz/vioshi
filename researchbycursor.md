# VIOGI — Investigación Completa del Proyecto

> Autor: Cursor (Claude Opus 4.7)
> Fecha: 2026-04-21
> Ruta analizada: `c:\Users\uzzie\Documents\viogi-dot-comm`

Este documento recoge, en profundidad, el funcionamiento interno, decisiones de
arquitectura, patrones recurrentes, flujos de datos y especificidades (buenas y
peculiares) del proyecto VIOGI después de una lectura exhaustiva del código.

---

## 1. Resumen ejecutivo

**VIOGI** es una tienda e-commerce de *streetwear premium* fabricada en México,
construida con **Next.js 14 (App Router)**, **React 18**, **TypeScript estricto**
y **Tailwind CSS**, internacionalizada con **next-intl v4** (español / inglés).

- **Sin backend real**: todas las páginas funcionan con datos mock (`lib/products.ts`,
  mocks en `account/`, `vender/`, etc.). El checkout simula el submit con un
  `setTimeout(2000)`.
- **Estado global mínimo**: un único `CartProvider` (Context API) con persistencia
  en `localStorage` bajo la clave `viogi_cart`.
- **Única integración externa real**: el lookup de códigos postales mexicanos contra
  `api-sepomex.hckdrk.mx` dentro del checkout.
- **Estética**: minimalismo extremo inspirado en Stüssy — blanco/negro, tipografías
  Helvetica Neue / Inter / Bebas Neue, mayúsculas con `tracking-wider`, tamaños
  tipográficos *muy* pequeños (10–13 px en la mayoría de la UI).
- **Dos idiomas, dos monedas**: `es → MXN`, `en → USD`. El conversor de precio
  (`lib/formatters.ts`) usa una tasa de cambio configurable por variable de
  entorno (`NEXT_PUBLIC_USD_MXN_RATE`, fallback 17.5). Los precios internos están
  en USD.

El `package.json` está deliberadamente limitado a 6 dependencias en producción:
`clsx`, `framer-motion` (aunque no se usa directamente en el código fuente,
está disponible), `next`, `next-intl`, `react`, `react-dom`.

---

## 2. Estructura del repositorio

```
viogi-dot-comm/
├── app/                       ← Next.js App Router
│   ├── layout.tsx             ← Solo devuelve children (el <html>/<body> lo pone [locale]/layout.tsx)
│   ├── error.tsx              ← Error boundary raíz (sin next-intl)
│   ├── not-found.tsx          ← 404 raíz (link a "/")
│   ├── globals.css            ← Tailwind + fuentes + animaciones custom
│   └── [locale]/              ← TODAS las rutas útiles viven bajo /es o /en
│       ├── layout.tsx         ← NextIntlClientProvider + CartProvider + ClientLayout
│       ├── page.tsx           ← Home (hero + grid)
│       ├── (shop)/cart/       ← Carrito completo (route group)
│       ├── checkout/
│       │   ├── page.tsx
│       │   └── success/[orderId]/page.tsx
│       ├── collections/[category]/page.tsx
│       ├── products/[slug]/
│       │   ├── page.tsx              ← Server component
│       │   └── ProductContent.tsx    ← Client component con la UI
│       ├── search/page.tsx
│       ├── wishlist/page.tsx
│       ├── archive/
│       │   ├── page.tsx
│       │   └── [slug]/page.tsx
│       ├── vender/page.tsx           ← Onboarding de marcas
│       ├── account/
│       │   ├── page.tsx              ← Login
│       │   ├── register/
│       │   ├── forgot-password/
│       │   ├── profile/
│       │   ├── addresses/
│       │   ├── archivos/             ← Facturas / comprobantes
│       │   └── orders/[orderId]/
│       └── pages/                    ← Contenido estático multilingüe
│           ├── customer-support/
│           ├── locaciones/
│           ├── shipping-payments-returns/
│           ├── size-guide/
│           ├── accessibility/
│           ├── legal/
│           └── chapters/
├── components/
│   ├── ClientLayout.tsx       ← Decide cuándo mostrar Header/Footer
│   ├── Header.tsx             ← Cabecera fija de ~1150 líneas (ver §6)
│   ├── Footer.tsx
│   ├── CartDrawer.tsx         ← Slide-in desde la derecha
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   ├── SupportNav.tsx         ← Nav pestañas de /pages/* (mobile only por defecto)
│   └── common/                ← Button, Input, Badge, Spinner (design system base)
├── store/
│   └── cartStore.tsx          ← Context API + localStorage
├── hooks/
│   └── useLocaleContext.ts    ← Locale + currency desde useParams()
├── lib/
│   ├── products.ts            ← Catálogo mock (13 productos) + getProducts / getProductBySlug
│   ├── constants.ts           ← Tax, shipping, STORAGE_KEYS, CATEGORIES...
│   ├── formatters.ts          ← formatPrice con Intl.NumberFormat
│   ├── pickupPoints.ts        ← 8 puntos de pickup (flagship, retail, partner)
│   ├── mexico.ts              ← lookupCP() contra SEPOMEX
│   └── utils.ts               ← cn() + generateId()
├── types/
│   ├── index.ts               ← Barrel (re-exporta product/cart/user/order)
│   ├── product.ts             ← Tipo Product rico (para el futuro backend)
│   ├── cart.ts
│   ├── order.ts
│   ├── user.ts
│   ├── delivery.ts            ← PickupPoint, DeliveryData
│   └── next-intl.d.ts         ← Types globales para traducciones
├── messages/
│   ├── es.json                ← ~450 líneas de traducciones
│   └── en.json
├── public/products/           ← 13 PNGs con nombres tipo "TEE STUSSY-S-200.png"
├── visual-search/             ← README.md con plan (sin código aún)
├── .claude/                   ← Comandos (audit.md, write-tests.md) + settings
├── .github/workflows/code-review.yml  ← Workflow AI code review (ESLint + tsc)
├── i18n.ts                    ← Config next-intl (locales, currencyMap, getRequestConfig)
├── middleware.ts              ← createMiddleware con localePrefix: 'always'
├── next.config.js             ← images.remotePatterns + withNextIntl
├── tailwind.config.ts
├── tsconfig.json              ← strict, paths: { "@/*": ["./*"] }
├── CLAUDE.md                  ← Guía para agentes IA en este repo
├── plan.md / plancheckout.md  ← Planes de desarrollo (docs internas)
├── research.md / research-checkout.md ← Snapshots previos de investigación
└── documento-secciones-tmpi.html      ← HTML suelto para copiar a Word (negocio)
```

---

## 3. Configuración del stack

### `package.json`
- Scripts: `dev`, `build`, `start`, `lint`, `type-check` (`tsc --noEmit`).
- Dependencias mínimas. **No hay dependencias de backend, ni ORM, ni auth, ni
  framework de tests** instalado, aunque `.claude/commands/write-tests.md` asume
  Jest + React Testing Library (todavía no hay código de pruebas).

### `tsconfig.json`
- `strict: true`, `target: ES2020`, `moduleResolution: bundler`.
- Alias de ruta única: `@/*` → `./*`.

### `tailwind.config.ts`
Muy simple: extiende `colors.background`/`colors.foreground` desde variables CSS,
añade fuente `logo` (Bebas Neue via `--font-logo`) y `letterSpacing` wide/wider.
No hay plugins. **La mayoría de estilos tipográficos se aplican con `style={...}`
inline** porque la tipografía exacta y los pesos (800, 500, 400) son críticos
para el look editorial; Tailwind se usa sobre todo para layout y espacios.

### `postcss.config.js` / `.eslintrc.json`
Estándar (`tailwindcss` + `autoprefixer`; `extends: next/core-web-vitals`).

### `next.config.js`
```js
const withNextIntl = require('next-intl/plugin')('./i18n.ts');
module.exports = withNextIntl({
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
});
```
Solo Unsplash está en la whitelist para `next/image` remoto — se usa en el
archivo editorial (`/archive`).

### `middleware.ts` + `i18n.ts`
`createMiddleware` de next-intl con `localePrefix: 'always'` y `localeDetection: true`.
El `matcher` excluye `api`, `_next` y cualquier ruta con extensión (`.*\..*`), es
decir, **todo lo que no sea asset o API pasa por el redirect a `/es` o `/en`**.

`i18n.ts` define `locales = ['es', 'en']`, `defaultLocale = 'es'` y un
`currencyMap = { es: 'MXN', en: 'USD' }`. Exporta `getRequestConfig` que carga
`messages/{locale}.json` en runtime, con fallback a defaultLocale si la URL trae
un locale inválido.

`types/next-intl.d.ts` amplía globalmente `IntlMessages` tipando con la forma
del `en.json`, lo que da autocompletado completo al llamar `useTranslations` /
`getTranslations`.

---

## 4. Internacionalización (i18n)

### Qué se localiza
- Textos de UI (~450 claves en cada archivo `messages/*.json`, organizadas en
  namespaces: `common`, `header`, `cart`, `checkout`, `footer`, `product`,
  `search`, `success`, `support`, `shipping`, `sizes`, `wishlist`, `archive`,
  `accessibility`, `locaciones`, `pages.home`, `pages.collections`, `account`).
- Plurales con la sintaxis ICU: `"{count, plural, one {# producto} other {# productos}}"`.
- Moneda: cambia según locale (MXN vs USD) via `formatPrice`.

### Qué NO se localiza
- Los **datos de producto** de `lib/products.ts` están solo en español
  (`name: "CHAMARRA HALPUTT"`, `description: "Chamarra Halputt talla L"`). El
  usuario inglés ve los mismos nombres en español.
- Los nombres de las categorías de `/collections/[category]` sí tienen mapa EN/ES
  en `categoryNames` dentro de la página, pero sin pasar por next-intl (hard-coded).
- `/archive` y `/archive/[slug]` tienen las descripciones de drops *hard-coded* en
  español.
- El mock de cuentas (`account/orders`, `account/profile`, etc.) está en español
  también.

### Detalle interesante del cambio de idioma
El header implementa `switchLocale()` con `window.location.href = newPath`
(full-page navigation) **deliberadamente**, con el comentario:

> *Full page navigation evita el error removeChild de React al cambiar locale
> (next-intl + App Router)*

Esto indica que en desarrollo hubo choques entre el árbol de React y el
re-montado al cambiar `/es` ↔ `/en`, y se decidió recargar la página completa.

### Layout bilingüe
El único layout "real" está en `app/[locale]/layout.tsx`:
```tsx
<NextIntlClientProvider locale={locale} messages={messages}>
  <CartProvider>
    <ClientLayout>{children}</ClientLayout>
  </CartProvider>
</NextIntlClientProvider>
```
El layout raíz (`app/layout.tsx`) es casi vacío a propósito (no contiene
`<html>`/`<body>`) porque el locale layout lo provee con `suppressHydrationWarning`.

---

## 5. Estado global — `CartProvider`

Ubicación: `store/cartStore.tsx`.

### API expuesta por `useCart()`
```ts
cart: Cart;
addItem(item: CartItem): void;
removeItem(itemId: string): void;
updateQuantity(itemId: string, quantity: number): void;
updateShippingCost(cost: number): void;
clearCart(): void;
itemCount: number;
isCartOpen: boolean;
openCart(): void;
closeCart(): void;
```

### Persistencia
- Al montar, **se hidrata desde `localStorage[viogi_cart]`** dentro de un
  `useEffect`, y se marca `isInitialized = true`.
- Solo después de `isInitialized`, se vuelve a guardar el carrito en
  `localStorage` en cada cambio (evita sobrescribir en el primer render).

### `calculateTotals`
Función **pura fuera del componente** que recibe `items` y un `prevShipping`
opcional:
- `subtotal = Σ price × quantity`
- `tax = subtotal × TAX_RATE` (0.16 — IVA México al 16 %)
- `shipping = items.length > 0 ? prevShipping : 0` (no cobra envío con carrito
  vacío, aunque conserva el valor anterior)
- `total = subtotal + tax + shipping`

### Deduplicación en `addItem`
Busca un item idéntico por (`productId`, `color`, `size`). Si existe, **suma las
cantidades**. Si no, lo añade nuevo. `updateQuantity` con `quantity < 1` borra el
item automáticamente.

### `updateShippingCost`
Actualiza solo `shipping` y `total` sin recalcular subtotal/tax (optimización);
lo usa el checkout cuando cambian método de envío o punto de pickup.

---

## 6. Componentes clave

### `components/ClientLayout.tsx`
Es el wrapper client-side que decide layout por ruta:
- **Si la ruta incluye `/account`** → oculta Header y Footer (login/perfil tienen
  look aislado con fondo gris).
- **Si la ruta incluye `/checkout`** → muestra Header pero oculta Footer (el
  checkout tiene su propio footer y header).
- Siempre monta `<CartDrawer />` (así el drawer se abre desde cualquier página).
- Mientras `mounted === false` renderiza un fallback con `<main className="pt-16">`
  para evitar mismatch de hidratación cuando la ruta cambia.

Usa una regex `^/[a-z]{2}` para quitar el prefijo del locale antes de comparar.

### `components/Header.tsx` (~1150 líneas)
El componente más grande y complejo. Responsabilidades:
- Header fijo transparente con fondo blanco solo cuando el search o el menú
  móvil están abiertos.
- Navegación principal: **SHOP**, **ARCHIVO**, **SOPORTE**.
- Cada enlace con submenú (SHOP y SOPORTE) es un `<Link>` que:
  - Si el usuario **ya está** en la sección → navega normalmente (no toggle).
  - Si **no está** en la sección → `preventDefault` + abre el submenú inline.
- Fila 2 (sub-header expandible): lista de categorías o de páginas de soporte
  con estado "activo" detectado por `pathnameWithoutLocale`.
- Selector de **idioma/moneda** (`ES / MXN` ↔ `EN / USD`) como dropdown
  desktop y modal fullscreen en mobile.
- Botón **BAG** con contador `itemCount` (sólo se renderiza tras montar para
  evitar mismatch SSR/CSR).
- Modal de **BUSCAR** con:
  - Overlay gris con cursor personalizado tipo "×" (SVG data URI).
  - `autoFocus` y cierre con `ESC`.
  - Actualmente **no dispara navegación a `/search`** desde aquí: solo captura
    texto en estado local `searchQuery`. El botón "search" de la página
    `/search` es el que hace la filtración real (ver §7).
- Acordeón de menú móvil con dos niveles (SHOP / SOPORTE) y banner "SHIPPING TO".
- Patrones de anti-hydration mismatch: casi todas las computaciones dependientes
  de `pathname` o `locale` se filtran con `mounted` booleano.

Todas las sub-categorías (`hoodie`, `chamarra`, `pants`, `jeans`, `camisas`,
`playeras`, `accesorios`, `bolsos`) están cableadas como links a
`/collections/{cat}`.

### `components/CartDrawer.tsx`
Slide-in desde la derecha (`animate-slide-in`, `@keyframes slideIn` en
`globals.css`) de 540 px en desktop, full-width en mobile. Muestra lista de
items con controles +/−, input numérico, texto de notas de envío, subtotal y
dos botones (**Seguir comprando** / **Checkout**). Cuando `cart.items.length === 0`
muestra un estado vacío con CTA a `/collections/all`.

### `components/Footer.tsx`
Footer simple de una fila: Instagram, "Quiero vender con ustedes" (→ `/vender`)
y copyright con `{year}` suplantado por `new Date().getFullYear()`
(`suppressHydrationWarning` por diferencia SSR/CSR del año).

### `components/ProductCard.tsx`
- Imagen 3/4, badge **NEW** y overlay **SOLD OUT**.
- Hover revela botón **QUICK ADD** absoluto, que hace `addItem` + `openCart`.
- Precio formateado con `formatPrice(price, locale)`.

### `components/ProductGrid.tsx`
Grid responsive con 2/3/4 columnas. Estado vacío simple.

### `components/SupportNav.tsx`
Solo visible en móvil en las páginas `/pages/*`. Barra de pestañas horizontal
scrollable con links a las 5 páginas de soporte y resaltado activo.

### `components/common/*`
Pequeño "design system" básico con `Button`, `Input`, `Badge`, `Spinner`
usando `clsx` via `cn()`. Prácticamente **no se usa en la app**: la mayoría de
páginas escriben sus propios botones con Tailwind + `style={...}`. Son útiles
como referencia o para evolucionar.

---

## 7. Flujos de usuario (E2E)

### Home (`/es` o `/en`)
`app/[locale]/page.tsx` (server component) llama a `getProducts()` y renderiza:
- Hero con el logo "VIOGI" en 6xl–8xl.
- CTA "SHOP NOW" hacia `/{locale}/collections/all`.
- Grid de los 13 productos (ProductGrid a 4 columnas).

### Categoría (`/es/collections/hoodie`)
Server component `app/[locale]/collections/[category]/page.tsx`:
- `getProducts(category)` filtra por `category` en `lib/products.ts`
  (`category === "all"` retorna todos; `"new"` filtra por `isNew` o
  `category === "new"`).
- Traduce `product_count` con plural ICU.
- Usa el mapa `categoryNames` local para el título EN/ES.

### Producto (`/es/products/tee-stussy-s`)
- `page.tsx` (server): `getProductBySlug`, `notFound()` si no existe, pasa todos
  los productos al cliente para poder navegar "siguiente producto".
- `ProductContent.tsx` (client):
  - Galería con **scroll vertical en desktop** (cada imagen ocupa 100 vh) y
    **carousel swipeable con dots en mobile**.
  - Breadcrumb dinámico "VOLVER A {categoria}".
  - Sección `<details>` colapsable con descripción.
  - Botón "AGREGAR A LA BOLSA" con estado `isAdding` (timeout 500 ms) y luego
    abre el Cart Drawer.
  - Si `soldOut === true` deshabilita el botón.

### Carrito (`/es/cart`)
Página completa (no solo el drawer). Tabla de items con controles y resumen
lateral con subtotal, envío, impuestos y total — los tres fluyen desde
`useCart()`. El botón "Checkout" navega a `/{locale}/checkout`.

### Checkout — el corazón de la app (`app/[locale]/checkout/page.tsx`)
Cliente de ~860 líneas con un único formulario estructurado en 4 secciones
numeradas:

1. **01 Contact** — email + checkbox "envíenme noticias".
2. **02 Delivery** — método (`home` / `pickup`):
   - *home*: país (MX/US), nombres, dirección + apartamento, **CP (5 dígitos)**
     que dispara lookup SEPOMEX, **dropdown de colonia**, municipio/estado
     readonly (autollenados), teléfono.
   - *pickup*: nombres + teléfono, `<select>` agrupado por "TIENDAS VIOGI"
     (flagship/retail) vs "PUNTOS AUTORIZADOS" (partner). Al elegir muestra
     dirección/horario/días, fecha mínima +2 días y slot de horario.
3. **03 Shipping method** — `RadioCard` de "Estándar" ($10 USD) vs "Express"
   ($20 USD). Solo aparece cuando la dirección está completa (`showShippingMethods`).
4. **04 Payment** — tarjeta (con formateo en vivo: `#### #### #### ####`,
   `MM/YY`, CVV numérico) o PayPal (muestra link `paypal.me/viogi` con botón
   "Copiar link" → clipboard).

Pie del formulario: checkbox "Guardar info", checkbox obligatorio de T&C con
links a `/pages/legal`, y botón enorme "Completar Pedido".

Validación custom con `formErrors` (terms, address, pickup, general). El submit
simula `await new Promise(res => setTimeout(res, 2000))` y navega a
`/{locale}/checkout/success/ORDER123` (ID hard-coded).

Componentes internos:
- `CustomSelect`: envuelve un `<select>` nativo con chevron SVG.
- `RadioCard`: reemplaza el radio nativo por un círculo minimalista.
- Constantes `INPUT`, `INPUT_READONLY`, `SECTION_LABEL` como estilos compartidos.

Detalles:
- Si el usuario entra al checkout con carrito vacío, `useEffect` redirige a
  `/cart`, excepto cuando `isSubmittingRef.current === true` (para no redirigir
  tras vaciar el carrito en el paso de éxito).
- `updateShippingCost(shippingCost)` se llama desde un `useEffect` cada vez que
  cambia el `shippingMethod` o el `pickupPointId`, sincronizando el total con
  `cartStore`.
- Sticky submit bar inferior en mobile.

### Success (`/checkout/success/[orderId]`)
`clearCart()` en `useEffect` + display del número de pedido recibido por params.
Muestra "what's next" con 3 pasos traducidos.

### Account / Auth (todas mocks)
- `/account` (login): email + contraseña (sin handler real), botón "Continue
  with Google" placeholder, link a registro y a forgot-password, selector
  ES/EN.
- `/account/register`: formulario con validación de "passwords_mismatch" y
  simulación async.
- `/account/forgot-password`: mock de envío de correo con pantalla de
  confirmación.
- `/account/profile`, `/account/orders`, `/account/orders/[orderId]`,
  `/account/addresses`, `/account/archivos`: todas con **mocks hard-coded**
  (tres pedidos, dos direcciones, tres documentos). El usuario es siempre
  "Juan Pérez".
- Todas las rutas `/account/*` ocultan Header/Footer (`ClientLayout`).

### Otras páginas
- `/wishlist`: usa tres IDs fijos `['1','2','3']` como mock, permite quitar
  items y vaciar con `confirm()`.
- `/vender`: onboarding para marcas externas (form con nombre, marca, IG,
  producto, experiencia, mensaje). Submit mock + pantalla de gracias.
- `/archive`: 3 "drops" con imágenes de Unsplash, descripciones hard-coded ES.
- `/archive/[slug]`: título del drop + grid de los primeros 8 productos.
- `/search`: filtra `products` por nombre/categoría/descripción client-side.
  Muestra "búsquedas populares" cuando no hay query. Envuelto en `<Suspense>`
  porque usa `useSearchParams`.
- `/pages/customer-support`: contacto + FAQ acordeón (8 preguntas).
- `/pages/locaciones`: Flagship CDMX + Guadalajara + Monterrey + note de
  stockists.
- `/pages/shipping-payments-returns`: políticas muy detalladas vía i18n.
- `/pages/size-guide`: tablas de tallas (con datos del bloque `sizes.*`).
- `/pages/accessibility`: declaración de compromiso WCAG 2.1 AA.
- `/pages/legal`: T&C + privacidad (texto ES hard-coded).
- `/pages/chapters`: 3 "capítulos" narrativos (Origins, Streets, Coming Soon).

---

## 8. Catálogo y datos

### `lib/products.ts`
13 productos hard-coded, todos con `price` en **USD** entero (entre 190 y 700).
Cada uno tiene:
- `id` numérico string ("1"–"13")
- `name` en español mayúsculas
- `image` apuntando a `public/products/...`
- `slug` kebab-case (único)
- `category` en español (`playeras`, `hoodie`, `chamarra`, `camisas`, `pants`,
  `jeans`, `accesorios`, `bolsos`)
- `size` opcional (talla específica, p.ej. "S", "L", "UNISEX", "32x32")
- `description` corta en español

Solo el Hoodie Playboy tiene `images: [...]` para la galería (con la misma foto
repetida tres veces). El resto cae al array `[image]`.

La función `getProducts(category?)` es *async* pero sin `await` real — preparada
para migrar a fetch contra backend sin tocar llamadas.

### Tipos en `types/`
- **`ProductData`** (en `lib/products.ts`) es el tipo "mock/actual".
- **`Product`** (en `types/product.ts`) es el tipo *rico* pensado para un backend
  futuro con `images: ProductImage[]`, `colors`, `sizes`, `stock`, `rating`, etc.
  Los comentarios del archivo dejan clara la distinción: **ProductData = Fase 1,
  Product = Fase 2+**.
- `Cart` / `CartItem` — modelo actual del carrito.
- `Order` + enums (`OrderStatus`, `PaymentStatus`, `PaymentMethod`) — listo para
  persistir pedidos.
- `User`, `UserRole`, `UserPreferences`, `Address` — modelado de cuenta.
- `DeliveryMethodType`, `PickupPointType`, `PickupPoint`, `DeliveryData`.

### Puntos de pickup — `lib/pickupPoints.ts`
8 localizaciones codificadas con `id`, `name`, dirección, ciudad, estado,
`additionalCost`, horario, `estimatedDays`, `type`:
- **Flagship** (gratis): CDMX, Guadalajara.
- **Retail** ($50 MXN extra): Monterrey, Querétaro.
- **Partner** (variable: $25, $40, $60, $75): Puebla, Mérida, Cancún, Tijuana.

Helpers: `getPickupPointById`, `getPickupPointsByState`, `getPickupPointsByType`.

### Lookup de códigos postales — `lib/mexico.ts`
Única llamada externa **real** del proyecto:
```ts
const res = await fetch(`https://api-sepomex.hckdrk.mx/query/info_cp/${cp}?type=JSON`);
```
SEPOMEX community mirror sin auth, devuelve array de asentamientos. La función
agrupa todas las colonias bajo el mismo CP, toma estado/municipio del primero.
En el checkout esto hace posible que el usuario solo escriba 5 dígitos y el
formulario se autollene.

### `lib/constants.ts`
- `TAX_RATE = 0.16` (IVA México)
- `STANDARD_SHIPPING_COST = 10`, `EXPRESS_SHIPPING_COST = 20` (en USD)
- `FREE_SHIPPING_THRESHOLD = 100` (no se está usando en la lógica actual pero
  está listo)
- `PAYPAL_ME_LINK = 'https://paypal.me/viogi'`
- `CATEGORIES` constante + `CategorySlug` type helpers
- `STORAGE_KEYS`: `viogi_cart`, `viogi_wishlist`, `viogi_recent_products`
  (solo `CART` está en uso actualmente).
- `DELIVERY_METHODS`, `DELIVERY_METHOD_LABELS`, `SORT_OPTIONS` definidos pero
  parcialmente usados.

### `lib/formatters.ts`
```ts
const EXCHANGE_RATE = parseFloat(process.env.NEXT_PUBLIC_USD_MXN_RATE ?? '17.5');
export function formatPrice(priceInUSD, locale, showDecimals = true) {
  const currency = locale === 'es' ? 'MXN' : 'USD';
  const price = locale === 'es' ? priceInUSD * EXCHANGE_RATE : priceInUSD;
  return new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    style: 'currency', currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(price);
}
```
Gotcha: la conversión y el símbolo se deciden a la vez. No hay caché ni API
real, así que todos los precios en `/es` se multiplican por 17.5 en el cliente.

### `lib/utils.ts`
- `cn(...inputs)`: wrapper de `clsx`.
- `generateId()`: `` `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` ``
  — IDs para items del carrito al añadir.

---

## 9. Estilo y CSS

### Tipografía
- **Logo / títulos destacados**: `Bebas Neue` (declarado vía `--font-logo` pero
  en la práctica la mayoría de títulos usan `'Helvetica Neue', 'Inter'` inline).
- **Cuerpo**: stack sans system fonts (`-apple-system`, `BlinkMacSystemFont`,
  `Segoe UI`...).
- **Tamaños**: muy pequeños. 10-11 px para la UI general, 13 px para `<h1>`,
  rara vez más grande. El pie del input de búsqueda usa `font-size: 10px` en
  móvil, `11 px` en desktop (declarado en `search-input-placeholder`).
- **Weights**: 400, 500, 600, 800 (sin 700).
- **Trucos tipográficos**: casi todos los textos "bold" añaden
  `textShadow: '0 0 0.5px rgba(0, 0, 0, 0.8)'` para conseguir un efecto
  ligeramente más "fat" sin cambiar el peso.

### Colores
- Monocromo blanco/negro casi absoluto.
- Grises: `#F5F5F5` (fondo de imágenes), `#666` (texto secundario), `#999`,
  `#ccc`, `#e8e8e8`, `#666666aa` y demás variantes.
- **No hay** color de marca, no hay acentos.
- Únicas excepciones: rojo `#red-500` para errores de formulario, y el logo
  Google de `/account` (con sus colores originales SVG).

### Animaciones / efectos
- `@keyframes slideIn` (drawer del carrito).
- Transitions cortas (150–300 ms) en `opacity` y `colors`.
- Cursor SVG personalizado en overlays (`search-overlay-cursor`): una "×"
  blanca de 24 px.
- `scrollbar-hide` para ocultar scroll manteniendo funcionalidad.
- `text-balance` utility.

### Imports de Google Fonts
Están en `globals.css` con `@import url(...)` — bloquean un poco más el render
que `next/font` pero ahorran la configuración.

---

## 10. Patrones recurrentes y convenciones

1. **"use client" solo cuando es necesario**. Toda página con `useState`,
   `useEffect`, `useRouter`, `useParams` declara el directive al principio. Las
   páginas 100 % contenido estático (legal, accessibility, locaciones,
   collections/[category], home, archive) son *server components*.
2. **`pt-16` en páginas con Header**. El header es `fixed top-0 h-14` y el
   `ClientLayout` inyecta `pt-16` al `<main>` cuando está presente.
3. **Mismo estilo tipográfico inline**. Casi todos los archivos re-declaran la
   constante:
   ```ts
   const fontStyle = {
     fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
   };
   ```
   (o su versión `FONT`). No está centralizado.
4. **Mocks con comentarios claros**. Cada archivo mock lleva `// TODO: Send to
   backend (Phase 2)` o `mockOrders`, `mockAddresses`, etc.
5. **Anti-hydration guard**. El patrón `const [mounted, setMounted] = useState(false)`
   seguido de `useEffect(() => setMounted(true), [])` aparece en Header,
   ClientLayout y varios hooks para postponer render dependiente de
   pathname/locale/storage.
6. **`mountedRef` en submits async** (`vender`, `register`, `forgot-password`,
   `profile`): evita actualizar estado después de desmontar.
7. **IDs de carrito generados en cliente** con `generateId()` (Date.now + random).
8. **Redirecciones con `window.location.href`** para cambios de locale
   (evita el bug removeChild documentado).
9. **Validación de formularios manual** (no hay Zod / react-hook-form). Se usa
   `required` HTML + objetos `formErrors` en estado local.

---

## 11. Rutas completas (cheat-sheet)

| URL | Tipo | Archivo |
|---|---|---|
| `/[locale]` | Server | `app/[locale]/page.tsx` |
| `/[locale]/collections/:category` | Server | `.../collections/[category]/page.tsx` |
| `/[locale]/products/:slug` | Server + Client | `.../products/[slug]/{page,ProductContent}.tsx` |
| `/[locale]/search` | Client (Suspense) | `.../search/page.tsx` |
| `/[locale]/cart` | Client | `.../(shop)/cart/page.tsx` (route group) |
| `/[locale]/checkout` | Client | `.../checkout/page.tsx` |
| `/[locale]/checkout/success/:orderId` | Client | `.../checkout/success/[orderId]/page.tsx` |
| `/[locale]/wishlist` | Client | `.../wishlist/page.tsx` |
| `/[locale]/archive` | Server | `.../archive/page.tsx` |
| `/[locale]/archive/:slug` | Server | `.../archive/[slug]/page.tsx` |
| `/[locale]/vender` | Client | `.../vender/page.tsx` |
| `/[locale]/account` | Client | `.../account/page.tsx` |
| `/[locale]/account/register` | Client | `.../account/register/page.tsx` |
| `/[locale]/account/forgot-password` | Client | `.../account/forgot-password/page.tsx` |
| `/[locale]/account/profile` | Client | `.../account/profile/page.tsx` |
| `/[locale]/account/addresses` | Client | `.../account/addresses/page.tsx` |
| `/[locale]/account/archivos` | Client | `.../account/archivos/page.tsx` |
| `/[locale]/account/orders` | Client | `.../account/orders/page.tsx` |
| `/[locale]/account/orders/:orderId` | Client | `.../account/orders/[orderId]/page.tsx` |
| `/[locale]/pages/customer-support` | Client | `.../pages/customer-support/page.tsx` |
| `/[locale]/pages/locaciones` | Server | `.../pages/locaciones/page.tsx` |
| `/[locale]/pages/shipping-payments-returns` | (?) | `.../pages/shipping-payments-returns/page.tsx` |
| `/[locale]/pages/size-guide` | Server | `.../pages/size-guide/page.tsx` |
| `/[locale]/pages/accessibility` | (?) | `.../pages/accessibility/page.tsx` |
| `/[locale]/pages/legal` | Server | `.../pages/legal/page.tsx` |
| `/[locale]/pages/chapters` | Server | `.../pages/chapters/page.tsx` |

El middleware redirige cualquier URL sin prefijo de locale (p.ej. `/` →
`/es` por detección de navegador o fallback).

---

## 12. Herramientas auxiliares y DX

### `.claude/`
- `commands/audit.md`: prompt guiado para que Claude Code haga un audit de
  seguridad, performance, accesibilidad y code quality.
- `commands/write-tests.md`: guía para escribir pruebas con Jest + RTL.
- `settings.local.json`: whitelist de comandos de shell (npm, taskkill,
  robocopy, etc.) para el permiso de Claude Code.

### `.github/workflows/code-review.yml`
CI simple en cada PR: obtiene los ficheros cambiados (`tj-actions/changed-files`),
corre `eslint --format json` + `tsc --noEmit`, y posta un comentario en el PR
con conteo de errores/warnings. Si ESLint falla no bloquea (`continue-on-error`).

### Documentos internos del repositorio
- **`CLAUDE.md`**: guía corta para IA (comandos, patrones, STORAGE_KEYS).
- **`plan.md`** (~490 líneas): plan detallado de *Fase 1* (bugs T-series) y
  *Fase 2* (integración de backend real). Incluye iteraciones atómicas.
- **`plancheckout.md`**: plan de rediseño del checkout y del login —
  documenta problemas de legibilidad, tamaño de fuente, e improvements.
- **`research.md`** (~500 líneas): snapshot detallado del estado del proyecto
  al 2026-03-23. Estructura equivalente (pero no idéntica) a este documento.
- **`research-checkout.md`**: research específico del checkout.
- **`documento-secciones-tmpi.html`**: HTML suelto que parece plantilla de
  copiado a Word (documento tipo TMPI, sin relación directa con la web).

### `visual-search/README.md`
Apenas un README con dos opciones de implementación (Gemini API vs Python+CLIP).
**Sin código aún**. Es una decisión futura.

---

## 13. Observaciones, riesgos y oportunidades

### Puntos fuertes
- Arquitectura **limpia y canónica** para un Next.js 14 con next-intl: capas
  separadas (app/components/lib/store/types/hooks/messages), tipos
  centralizados, helpers puros para cálculos, internacionalización completa.
- **TypeScript estricto** y `@/` paths consistentes.
- El carrito tiene una API simple y está listo para múltiples variantes de
  producto (clave compuesta productId+color+size).
- El checkout es extenso pero está bien compartimentado (RadioCard / CustomSelect
  / SECTION_LABEL / INPUT).
- i18n global con ICU plurales.
- Accesibilidad: `aria-label`, `role="status"`, `sr-only`, `suppressHydrationWarning`
  donde corresponde, y página dedicada al compromiso WCAG.

### Puntos a mejorar / peculiaridades
1. **Header.tsx es un monolito de 1150 líneas** — cada link repite 15 líneas
   de `style={{ ... }}`. Merece extraerse a un componente `NavLink`.
2. **`fontStyle` constante repetida** en ~20 archivos. Candidato a
   `globals.css` como utility class o a una `const` en `lib/constants.ts`.
3. **Textos hard-coded no traducidos** en `/vender`, `/pages/legal` (partes),
   `/archive/*`, `/account/orders` (status "Entregado"), mocks de `account/*`.
4. **Precios en USD internos con conversión cliente**: la tasa 17.5 es estática
   y no refleja tipo de cambio real. En ES los precios se multiplican por esa
   constante y pueden desalinearse con la realidad.
5. **El search del Header no se conecta con `/search`**: el input captura
   texto localmente; para que navegue a `/search?q=...` habría que wirear el
   submit o añadir un botón enter handler.
6. **`components/common/*` casi no se usa**. Los botones se implementan inline
   en cada página con Tailwind + style inline — puede degradar consistencia.
7. **Dependencia `framer-motion`** declarada pero no importada (grep no lo
   encuentra). Candidato a quitar o a usar en animaciones que hoy son CSS puro.
8. **Sin tests automatizados** pese al comando `.claude/commands/write-tests.md`.
9. **Mocks en el cliente para cuentas y pedidos** (`/account/orders`,
   `/account/profile`) — necesitan backend real para Fase 2.
10. **Checkout no persiste el estado del formulario** entre recargas, ni
    integra pagos reales (solo `setTimeout(2000)`).
11. **`lib/products.ts` es async sin await** — es apenas un placeholder para
    migrar sin romper el árbol de llamadas.
12. **La página `/pages/legal` mezcla texto hardcoded en español**, mientras
    que el resto de `/pages/*` usa next-intl — inconsistencia de i18n.
13. **El nombre de archivo `JEANS WRANGLER-32x32- 250.png`** tiene un espacio
    antes de `250` — importante respetar la ruta exacta en `products.ts:142`
    (lo dice explícitamente `plan.md`).
14. **Dependencia de API externa SEPOMEX** sin key y sin rate limiting propio —
    podría caerse o rate-limitear sin fallback.
15. **El `/search` solo filtra por `name`, `category`, `description`**. No
    cubre variantes ni fuzzy matching.

### Fases de evolución claras (según `plan.md`)
- **Fase 1**: estabilización (precios i18n, TAX correcto, imágenes).
- **Fase 2**: backend (cuentas, pedidos, pagos, stock, productos dinámicos).
- **Fase 3 (implícita)**: módulo `visual-search` (Gemini o CLIP).

---

## 14. Lista de archivos más importantes (TL;DR)

- **Shell app**: `app/[locale]/layout.tsx`, `components/ClientLayout.tsx`,
  `components/Header.tsx`, `components/Footer.tsx`, `components/CartDrawer.tsx`.
- **Estado y datos**: `store/cartStore.tsx`, `lib/products.ts`,
  `lib/pickupPoints.ts`, `lib/constants.ts`, `lib/formatters.ts`,
  `lib/mexico.ts`, `hooks/useLocaleContext.ts`.
- **Tipos**: `types/*.ts` (barrel en `index.ts`, DB-rich en `product.ts`).
- **i18n**: `i18n.ts`, `middleware.ts`, `messages/{es,en}.json`,
  `types/next-intl.d.ts`.
- **Página crítica**: `app/[locale]/checkout/page.tsx` (CP lookup + payment UX +
  delivery methods).
- **Documentos meta**: `CLAUDE.md`, `plan.md`, `plancheckout.md`, `research.md`.

---

## 15. Conclusión

VIOGI es un **e-commerce front-end de alta fidelidad** con estética editorial
stüssy-inspirada, escrito con patrones modernos de Next.js 14 App Router y
preparado conceptualmente (tipos, constantes, capas de datos) para conectarse
a un backend real cuando llegue el momento. Su mayor complejidad no está en la
arquitectura sino en:

1. El **checkout** (flujos, validaciones, SEPOMEX, pagos manuales con PayPal).
2. El **Header** (navegación multinivel, submenús, idioma/moneda, search).
3. La **gestión de hydration** (muchos `mounted` guards y recargas completas
   en cambios de locale).

El "modo mock" actual es deliberado: el equipo está construyendo primero la
experiencia visual y de interacción, y las capas `types/`, `lib/` y la API de
`CartProvider` están listas para intercambiar los mocks por llamadas reales
con cambios mínimos.
