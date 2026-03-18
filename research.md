# VIOGI — Research & Estado del Proyecto

> Última actualización: 2026-03-17

---

## 1. ESTRUCTURA ACTUAL

```
viogi-dot-comm/
├── app/
│   ├── layout.tsx                          ← Layout raíz (solo pasa children)
│   ├── error.tsx                           ← Error boundary global
│   ├── not-found.tsx                       ← 404 global (link a / — middleware maneja locale)
│   ├── globals.css                         ← Fuentes, variables CSS, animaciones
│   └── [locale]/
│       ├── layout.tsx                      ← NextIntlClientProvider + CartProvider + ClientLayout
│       ├── page.tsx                        ← Home
│       ├── (shop)/cart/page.tsx            ← Carrito ✓
│       ├── checkout/
│       │   ├── page.tsx                    ← Checkout completo ✓ (CP lookup, formatPrice)
│       │   └── success/[orderId]/page.tsx  ← Confirmación de pedido ✓
│       ├── collections/[category]/page.tsx ← Categorías ✓ (i18n product_count)
│       ├── products/[slug]/
│       │   ├── page.tsx
│       │   └── ProductContent.tsx          ← Detalle de producto
│       ├── search/page.tsx
│       ├── wishlist/page.tsx               ← Lista de deseos ✓
│       ├── archive/
│       │   ├── page.tsx                    ← ✓ sin Header/Footer propios
│       │   └── [slug]/page.tsx
│       ├── vender/page.tsx
│       ├── account/
│       │   ├── page.tsx                    ← Login ✓
│       │   ├── register/page.tsx           ← ✓ UI sin backend
│       │   ├── forgot-password/page.tsx    ← ✓ UI sin backend
│       │   ├── profile/page.tsx
│       │   ├── addresses/page.tsx
│       │   ├── orders/page.tsx
│       │   ├── orders/[orderId]/page.tsx
│       │   └── archivos/page.tsx           ← Nueva (merge rama final)
│       └── pages/
│           ├── customer-support/page.tsx   ← ✓ Rediseño Stüssy, i18n, SupportNav mobile
│           ├── shipping-payments-returns/  ← ✓ Rediseño Stüssy, i18n, SupportNav mobile
│           ├── size-guide/page.tsx         ← ✓ Rediseño Stüssy, i18n
│           ├── legal/page.tsx              ← ✓ Contenido básico
│           ├── accessibility/page.tsx      ← ✓ Rediseño Stüssy, i18n
│           ├── chapters/page.tsx           ← Placeholder limpio (sin Header/Footer propios)
│           └── locaciones/page.tsx         ← ✓ Rediseño Stüssy, i18n
│
├── components/
│   ├── Header.tsx                          ← Navegación, search, locale switcher ✓
│   ├── Footer.tsx                          ← Links, copyright, legal ✓
│   ├── ClientLayout.tsx                    ← Shell global: Header/Footer (oculta en account)
│   ├── SupportNav.tsx                      ← Nav mobile-only para páginas de soporte
│   ├── CartDrawer.tsx                      ← Drawer lateral del carrito ✓
│   ├── ProductCard.tsx                     ← formatPrice ✓, i18n badges ✓
│   ├── ProductGrid.tsx                     ← Grid responsivo ✓
│   └── common/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       └── Spinner.tsx
│
├── store/
│   └── cartStore.tsx                       ← Context API + localStorage ✓
│
├── hooks/
│   └── useLocaleContext.ts                 ← Locale y currency desde params ✓
│
├── lib/
│   ├── products.ts                         ← Mock data (13 productos), ProductData interface ✓
│   ├── formatters.ts                       ← formatPrice con locale y tipo de cambio ✓
│   ├── constants.ts                        ← TAX_RATE=0.16, CATEGORIES alineadas, shipping ✓
│   ├── pickupPoints.ts                     ← 8 puntos de entrega hardcodeados
│   ├── mexico.ts                           ← lookupCP() via SEPOMEX (CP → colonia/municipio/estado)
│   └── utils.ts                            ← cn(), generateId()
│
├── types/
│   ├── index.ts
│   ├── product.ts                          ← Tipo rico Product (para DB futura)
│   ├── cart.ts
│   ├── user.ts
│   ├── order.ts
│   └── delivery.ts
│
├── messages/
│   ├── en.json                             ← ~200 claves en inglés
│   └── es.json                             ← ~200 claves en español
│
├── visual-search/
│   └── README.md                           ← Módulo planificado (Gemini API)
│
├── middleware.ts                           ← Locale routing con next-intl
├── i18n.ts                                 ← Configuración de next-intl
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 2. ARQUITECTURA DE LAYOUT

### Patrón correcto (establecido en Iteración 4)

`ClientLayout.tsx` es el único proveedor de Header, Footer y CartDrawer para todas las rutas.
Las páginas NO deben incluir sus propios `<Header />` o `<Footer />`.

```tsx
// ClientLayout.tsx
return (
  <>
    {!isAccount && <Header />}           // Header oculto en /account/*
    <main className={!isAccount ? 'pt-16' : ''}>{children}</main>
    {!isCheckout && !isAccount && <Footer />}   // Footer oculto en checkout y account
    <CartDrawer />
  </>
);
```

**Regla:** Las páginas retornan solo su contenido (`<div>`, no `<main>`).
No necesitan `pt-16` porque ClientLayout ya lo aplica (salvo que sean rutas de account).

---

## 3. ESTADO DE CADA PÁGINA

| Página | i18n | Links locale | Diseño | Notas |
|---|---|---|---|---|
| Home | ✓ | ✓ | ✓ | — |
| Collections | ✓ | ✓ | ✓ | product_count con plural |
| Product detail | Parcial | ✓ | ✓ | Texto de navegación hardcodeado en ProductContent |
| Cart | ✓ | ✓ | ✓ | — |
| Checkout | ✓ | ✓ | ✓ | CP lookup SEPOMEX, formatPrice, PayPal manual |
| Checkout success | ✓ | ✓ | ✓ | ORDER123 hardcoded (sin backend aún) |
| Search | Parcial | ✓ | ✓ | Texto hardcodeado en algunos labels |
| Wishlist | ✓ | ✓ | ✓ | localStorage, sin sync con backend |
| Archive | ✓ | ✓ | ✓ | Mock entries, sin Header/Footer propios |
| Archive [slug] | ✓ | ✓ | ✓ | — |
| Vender | Parcial | ✓ | ✓ | Form sin backend |
| Account login | ✓ | ✓ | ✓ | Sin backend real |
| Account register | ✓ | ✓ | ✓ | Sin backend real |
| Account forgot-pw | ✓ | ✓ | ✓ | Sin backend real |
| Account profile | Parcial | ✓ | Parcial | Placeholder sin backend |
| Account addresses | Parcial | ✓ | Parcial | Placeholder sin backend |
| Account orders | Parcial | ✓ | Parcial | Placeholder sin backend |
| Account orders detail | Parcial | ✓ | Parcial | Placeholder sin backend |
| Account archivos | — | ✓ | Parcial | Nueva página, contenido básico |
| Customer support | ✓ | ✓ | ✓ | Stüssy style, FAQ acordeón, SupportNav mobile |
| Shipping & returns | ✓ | ✓ | ✓ | Stüssy style, dos columnas, SupportNav mobile |
| Size guide | ✓ | ✓ | ✓ | Stüssy style, tablas limpias |
| Legal | ✓ | ✓ | ✓ | Contenido básico presente |
| Accessibility | ✓ | ✓ | ✓ | Stüssy style, SupportNav mobile |
| Chapters | — | ✓ | Parcial | Placeholder limpio, contenido a integrar en Archive |
| Locaciones | ✓ | ✓ | ✓ | Stüssy style, dos columnas, SupportNav mobile |

---

## 4. BUGS RESUELTOS

### 4.1 Serie T (tipos, i18n, precios)

| Bug | Descripción | Estado |
|---|---|---|
| T-01 | ProductCard mostraba precio sin formatear | ✅ RESUELTO — `formatPrice(price, locale)` |
| T-02 | Colisión de tipos `Product` en products.ts y types/product.ts | ✅ RESUELTO — `ProductData` en products.ts, `Product` rico en types/ |
| T-03 | Imagen Jeans con espacios en el path | ⚠️ VERIFICAR — path sigue teniendo espacio: `/products/JEANS WRANGLER-32x32- 250.png` |
| T-04 | TAX_RATE = 0.1 (10%) en lugar de IVA México 16% | ✅ RESUELTO — `TAX_RATE = 0.16` |
| T-05 | CATEGORIES con slugs incorrectos (tees, outerwear) | ✅ RESUELTO — alineadas con catálogo real |
| T-06 | Contador de productos en colecciones hardcodeado en inglés | ✅ RESUELTO — `product_count` con plural i18n |

### 4.2 Serie B (checkout)

| Bug | Descripción | Estado |
|---|---|---|
| B-01 | Precios en checkout hardcodeados en USD | ✅ RESUELTO — `formatPrice` en todos los displays de precio |
| B-02 | Doble símbolo de moneda ("MXN $450.00") | ✅ RESUELTO |
| B-03 | Costos de envío hardcodeados e inconsistentes ($25 vs $20 en constants) | ✅ RESUELTO — usa `STANDARD_SHIPPING_COST` / `EXPRESS_SHIPPING_COST` |
| B-04 | Costo de pickup hardcodeado | ✅ RESUELTO — `formatPrice(selectedPickupPoint.additionalCost, locale)` |
| B-05 | Submit falso — ORDER123 hardcodeado, sin backend | ⏳ PENDIENTE — requiere Fase 2 |
| B-06 | PayPal inadecuado para mercado MX | ⚠️ PARCIAL — mantenido como link manual temporal (`PAYPAL_ME_LINK`). Será reemplazado por MercadoPago en Fase 2 |

### 4.3 GUI (checkout)

| ID | Descripción | Estado |
|---|---|---|
| GUI-01 | Validación con `alert()` nativo | ⏳ PENDIENTE |
| GUI-02 | Campos de tarjeta sin masking | ⏳ PENDIENTE |
| GUI-03 | CTA sticky en móvil | ⏳ PENDIENTE |
| GUI-04 | Página de éxito inexistente (404) | ✅ RESUELTO — página existe |
| GUI-05 | Sin skeleton/loading en checkout | ⏳ PENDIENTE |
| GUI-06 | `handleExpressCheckout` crash en click | ✅ RESUELTO — botones de express checkout eliminados |

### 4.4 Arquitectura

| Bug | Descripción | Estado |
|---|---|---|
| A-01 | Header/Footer duplicados en páginas individuales | ✅ RESUELTO — eliminados de todas las páginas (Iteración 4) |
| A-02 | `<main>` anidado (HTML inválido) | ✅ RESUELTO — páginas usan `<div>`, no `<main>` |
| A-03 | SupportNav visible en desktop (duplicaba submenu del Header) | ✅ RESUELTO — `md:hidden` |
| A-04 | Chapters en SupportNav (no es página de soporte) | ✅ RESUELTO — eliminado de tabs |

---

## 5. BUGS PENDIENTES / DEUDA TÉCNICA

### 5.1 Frontend (sin backend)

| ID | Archivo | Descripción | Prioridad |
|---|---|---|---|
| T-03 | `lib/products.ts:143` | Path de imagen Jeans tiene espacios — verificar si el archivo físico existe con ese nombre en `/public/products/` | Media |
| GUI-01 | `checkout/page.tsx` | Validación usa `alert()` nativo — reemplazar con errores inline | Media |
| GUI-02 | `checkout/page.tsx` | Campos de tarjeta sin masking | Baja |
| GUI-03 | `checkout/page.tsx` | Sin CTA sticky en móvil | Baja |
| GUI-05 | `checkout/page.tsx` | Sin skeleton de hidratación | Baja |
| I18N-01 | `search/page.tsx` | Algunos labels hardcodeados | Baja |
| I18N-02 | `products/[slug]/ProductContent.tsx` | Nombre de categoría hardcodeado | Baja |
| CON-01 | `checkout/page.tsx:277` | `ORDER123` hardcodeado — requiere backend | Bloqueante (Fase 2) |
| CON-02 | `checkout/page.tsx` | PayPal es link manual, no integración real | Fase 2 |
| CON-03 | `pages/chapters/page.tsx` | Contenido placeholder — pendiente integrar a Archive | Baja |

### 5.2 Requieren backend (Fase 2)

| Página/Feature | Estado actual | Qué falta |
|---|---|---|
| Checkout submit | Simula delay + ORDER123 | API, base de datos, procesador de pagos |
| Account profile | Form estático | CRUD contra DB |
| Account addresses | Form estático | CRUD contra DB |
| Account orders | Lista vacía | Historial real desde DB |
| Account archivos | Contenido básico | Integración real |
| Wishlist | localStorage | Sincronizar con cuenta de usuario |
| Vender form | Form que no envía | Endpoint backend o email service |
| Auth | UI completa | NextAuth.js + DB |

---

## 6. LO QUE ESTÁ BIEN

- Infraestructura i18n sólida (next-intl v4, middleware, messages bien estructurados)
- `CartStore` correctamente implementado con hidratación y persistencia
- `ClientLayout` provee Header/Footer/Cart de forma global y condicional
- `checkout/page.tsx` bien implementado — CP lookup SEPOMEX, formatPrice, locale-aware
- `formatPrice(price, locale)` aplicado en ProductCard, CartDrawer, Checkout, Cart
- `TAX_RATE = 0.16` correcto
- `CATEGORIES` alineadas con catálogo real
- `ProductData` separado de `Product` (mock vs DB)
- Todas las páginas de soporte rediseñadas con estilo Stüssy coherente
- `SupportNav` correctamente mobile-only
- Sistema de tipos robusto en `types/`

---

## 7. SISTEMA DE MENSAJES (i18n)

### Namespaces actuales en messages/en.json + es.json

| Namespace | Claves | Descripción |
|---|---|---|
| `common` | 12 | Textos globales (close, search, country, etc.) |
| `header` | ~35 | Navegación, categorías, soporte |
| `cart` | 15 | Carrito de compras |
| `checkout` | ~55 | Checkout completo incluyendo CP/colonia/municipio/PayPal |
| `footer` | 4 | Instagram, sell_with_us, copyright, legal |
| `product` | 10 | Detalle de producto |
| `success` | 9 | Confirmación de pedido |
| `support` | 22 | Customer support + FAQs |
| `shipping` | 30 | Shipping & returns |
| `sizes` | 14 | Guía de tallas |
| `wishlist` | 9 | Lista de deseos |
| `archive` | 10 | Archivo |
| `accessibility` | 14 | Accesibilidad |
| `locaciones` | 10 | Tiendas y puntos de venta |
| `pages` | 8 | Home y colecciones |
| `account` | ~35 | Login, registro, forgot password |

---

## 8. FUNCIONALIDAD `lib/mexico.ts` — CP Lookup

Función utilitaria que consulta la API pública de SEPOMEX para autocompletar dirección por CP.

```typescript
lookupCP(cp: string): Promise<MexicoCPData | null>
// Retorna: { estado, municipio, colonias: string[] }
// Endpoint: api-sepomex.hckdrk.mx (community, sin API key)
// Validación: 5 dígitos numéricos exactos
// En checkout: auto-rellena colonia (select si múltiples), municipio y estado
```

**Riesgo:** Dependencia de servicio comunitario sin SLA. En producción considerar:
1. Fallback a entrada manual si la API falla (ya implementado — muestra inputs normales si `cpData === null`)
2. Caché local del CP en el cliente para evitar llamadas repetidas

---

## 9. ROADMAP

### Etapa A — Frontend completo (estado actual: ~90%)

Pendiente:
- Corrección T-03 (imagen Jeans)
- Mejoras GUI-01, GUI-02, GUI-03, GUI-05 (checkout UX)
- Integrar Chapters a Archive
- i18n faltante en search y ProductContent

### Etapa B — Backend e infraestructura

```
2.1  Supabase (PostgreSQL) + Prisma ORM
      ├── Schema: Product, ProductVariant, ProductImage, Order, OrderItem, User
      ├── Seed: migrar 13 productos mock
      └── ISR en páginas de producto/colecciones

2.2  Auth (NextAuth.js v5)
      ├── Credentials (email/password con bcrypt)
      ├── Google OAuth (opcional)
      └── Proteger rutas /account/profile, /addresses, /orders

2.3  Pagos
      ├── MercadoPago Bricks (primario — OXXO, wallet, tarjetas MX)
      └── Stripe Payment Element (secundario — tarjetas internacionales, Apple/Google Pay)

2.4  Órdenes + Emails
      ├── Webhook: confirmar pago → crear Order en DB → enviar email
      ├── Resend: email de confirmación con items y número de orden
      └── Inventario en tiempo real (stock por variante)
```

### Etapa C — Panel de Administración

```
/admin
  ├── CRUD de productos con upload de fotos (Supabase Storage)
  ├── Gestión de órdenes
  ├── Gestión de vendedores (hacia marketplace)
  └── Analytics básicos
```

### Etapa D — Visual Search

```
/visual-search
  ├── ImageDropzone (upload drag & drop)
  ├── Gemini Vision API → extrae atributos de la prenda
  ├── Matching contra catálogo con scoring
  └── RecommendationGrid + outfit suggestions
```

### Etapa E — Marketplace (largo plazo)

```
  ├── Onboarding de vendedores (conectado a /vender)
  ├── Multi-vendor: productos por vendedor
  ├── Sistema de comisiones
  └── Reviews y ratings
```

---

## 10. REFERENCIAS RÁPIDAS

### Patrón correcto para nueva página

```tsx
// Server Component con i18n
import { getTranslations } from 'next-intl/server';
import { getLocale } from 'next-intl/server';

export default async function MiPagina() {
  const t = await getTranslations('miNamespace');
  const locale = await getLocale();
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        {/* contenido — sin Header/Footer/main propios */}
      </div>
    </div>
  );
}

// Client Component con i18n
'use client';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/hooks/useLocaleContext';

export default function MiPagina() {
  const t = useTranslations('miNamespace');
  const { locale } = useLocaleContext();
  return <div className="min-h-screen bg-white">...</div>;
}
```

### Tipografía del sistema de diseño

```tsx
const fontStyle = {
  fontFamily: "'Helvetica Neue', 'Inter', Helvetica, Arial, sans-serif",
};
// Tamaños: fontSize: '11px' (body/labels), '13px' (títulos de sección)
// Pesos: fontWeight: 400 (body), 500 (labels/headers)
// Siempre uppercase + tracking-wide para headers
```

### Formato de precios

```tsx
import { formatPrice } from '@/lib/formatters';
// Uso:
formatPrice(price, locale)  // price en USD, locale 'es' | 'en'
// → MX$3,500.00 en /es/
// → $200.00 en /en/
// Tasa de cambio: NEXT_PUBLIC_USD_MXN_RATE (default 17.5)
```

### Costos de infraestructura estimados (1,000 ventas/mes)

| Servicio | Costo/mes |
|---|---|
| Vercel | $0–20 |
| Supabase (DB + Auth + Storage) | $0 (free tier) |
| Cloudflare R2 (imágenes) | ~$0.15 |
| MercadoPago | ~3.5% GMV |
| Resend (emails) | $0 (free tier) |
| **Total fijo** | **< $25 USD/mes** |
