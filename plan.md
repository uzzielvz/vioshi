# VIOGI — Plan de Desarrollo: Fase 1 y Fase 2

> Creado: 2026-03-12
> Autor: Claude Code
> Objetivo: Corregir bugs T-series + integración de backend real

---

## Reglas del Plan

1. **Una iteración a la vez** — completar, probar y commitear antes de la siguiente
2. **Después de cada iteración:** ejecutar `npm run type-check && npm run lint && npm run build`
3. **Después de cada iteración:** actualizar `research.md` con el estado actual (bugs resueltos, estado de páginas)
4. **Scope cerrado** — no agregar features no listadas en la iteración activa
5. **Commit atómico por iteración** — mensaje descriptivo con qué bugs resuelve

---

## FASE 1 — Correcciones T-Series y Estabilización

> Duración estimada: 1 día
> Pre-requisito: ninguno
> Meta: codebase 100% consistente y listo para conectar backend

---

### Iteración 1.1 — Precio i18n en ProductCard + imagen Jeans

**Bugs:** T-01, T-03
**Archivos:** `components/ProductCard.tsx`, `lib/products.ts`
**Tiempo estimado:** 20 min

**Cambios:**

1. `components/ProductCard.tsx:136`
   - Agregar import: `import { formatPrice } from '@/lib/formatters';`
   - Reemplazar `${price.toLocaleString('en-US')}` por `{formatPrice(price, locale)}`

2. `lib/products.ts:142`
   - Verificar nombre real del archivo en `/public/products/`
   - Corregir path: `"/products/JEANS WRANGLER-32x32- 250.png"` → sin espacio

**Verificación post-iteración:**
- [ ] En `/es/`: precios muestran `$X,XXX MXN`
- [ ] En `/en/`: precios muestran `$XXX USD`
- [ ] Producto Jeans Wrangler carga imagen sin 404
- [ ] `npm run type-check` ✅
- [ ] `npm run lint` ✅
- [ ] `npm run build` ✅

---

### Iteración 1.2 — TAX_RATE correcto + i18n en colecciones

**Bugs:** T-04, T-06
**Archivos:** `lib/constants.ts`, `app/[locale]/collections/[category]/page.tsx`, `messages/es.json`, `messages/en.json`
**Tiempo estimado:** 30 min

**Cambios:**

1. `lib/constants.ts:22`
   - `TAX_RATE = 0.1` → `TAX_RATE = 0.16`

2. `messages/es.json` — agregar en sección `"pages"` → `"collections"`:
   ```json
   "product_count": "{count, plural, one {# producto} other {# productos}}"
   ```

3. `messages/en.json` — agregar en sección `"pages"` → `"collections"`:
   ```json
   "product_count": "{count, plural, one {# product} other {# products}}"
   ```

4. `app/[locale]/collections/[category]/page.tsx`
   - Convertir a Client Component o usar locale del params para `useTranslations`
   - Opción más simple: usar ternario con param `locale` del URL para mostrar texto correcto
   - Reemplazar: `{products.length} {products.length === 1 ? "Product" : "Products"}`

**Nota sobre T-04:** El cambio de TAX_RATE de 10% a 16% modifica los totales del carrito. Verificar visualmente que los números se ven correctos en el CartDrawer y en checkout.

**Verificación post-iteración:**
- [ ] Carrito: impuesto de un producto de $200 USD = $32 USD (no $20)
- [ ] En `/es/collections/all`: muestra "X productos" en español
- [ ] En `/en/collections/all`: muestra "X products" en inglés
- [ ] `npm run type-check` ✅
- [ ] `npm run lint` ✅
- [ ] `npm run build` ✅

---

### Iteración 1.3 — Limpieza de CATEGORIES en constants

**Bug:** T-05
**Archivos:** `lib/constants.ts`, posibles consumidores
**Tiempo estimado:** 25 min

**Cambios:**

1. Búsqueda de usages: verificar con `grep -r "CATEGORIES\|CATEGORY_NAMES" --include="*.tsx" --include="*.ts"` qué archivos consumen estas constantes actualmente

2. Si no hay consumidores reales de `CATEGORIES`/`CATEGORY_NAMES`:
   - Reemplazar el objeto `CATEGORIES` con las categorías reales:
   ```typescript
   export const CATEGORIES = {
     ALL: "all",
     PLAYERAS: "playeras",
     HOODIE: "hoodie",
     CHAMARRA: "chamarra",
     CAMISAS: "camisas",
     PANTS: "pants",
     JEANS: "jeans",
     ACCESORIOS: "accesorios",
     BOLSOS: "bolsos",
   } as const;

   export const CATEGORY_NAMES: Record<string, { es: string; en: string }> = {
     all: { es: "Todos los Productos", en: "All Products" },
     playeras: { es: "Playeras", en: "Tees" },
     hoodie: { es: "Hoodies", en: "Hoodies" },
     chamarra: { es: "Chamarras", en: "Jackets" },
     camisas: { es: "Camisas", en: "Shirts" },
     pants: { es: "Pants", en: "Pants" },
     jeans: { es: "Jeans", en: "Jeans" },
     accesorios: { es: "Accesorios", en: "Accessories" },
     bolsos: { es: "Bolsos", en: "Bags" },
   };
   ```

3. Actualizar `app/[locale]/collections/[category]/page.tsx` para usar `CATEGORY_NAMES[category][locale]`

**Verificación post-iteración:**
- [ ] Todas las colecciones muestran nombre correcto en ES y EN
- [ ] No hay referencias a `TEES`, `OUTERWEAR`, `ACCESSORIES` (del objeto viejo) en el código
- [ ] `npm run type-check` ✅
- [ ] `npm run lint` ✅
- [ ] `npm run build` ✅

---

### Iteración 1.4 — Reconciliación de tipos Product

**Bug:** T-02
**Archivos:** `lib/products.ts`, `types/product.ts`, todos los consumidores
**Tiempo estimado:** 40 min

Esta es la iteración más cuidadosa: hay dos mundos que reconciliar sin romper los consumidores.

**Estrategia:** Mantener la interfaz simple en `lib/products.ts` pero renombrarla para claridad, y hacer que `types/product.ts` exporte ambas.

**Cambios:**

1. En `lib/products.ts`: renombrar la interfaz local a `ProductData` y exportarla
   ```typescript
   export interface ProductData {
     id: string;
     name: string;
     price: number;
     image: string;
     images?: string[];
     slug: string;
     description?: string;
     category?: string;
     soldOut?: boolean;
     isNew?: boolean;
     size?: string;
     variants?: { size?: string[]; color?: string[]; };
   }
   ```
   - Cambiar `getProducts(): Promise<Product[]>` → `Promise<ProductData[]>`
   - Cambiar `getProductBySlug()` → retorna `ProductData | null`

2. En `types/product.ts`: mantener el tipo rico `Product` para uso futuro con DB. Agregar comentario: `// Tipo para DB real — usar ProductData para datos mock`

3. Actualizar todos los consumidores de `Product` de `lib/products.ts`:
   - `components/ProductCard.tsx` — props ya son campos simples, no tipado Product directamente ✅
   - `components/ProductGrid.tsx` — verificar
   - `app/[locale]/products/[slug]/ProductContent.tsx` — verificar
   - `app/[locale]/page.tsx` — verificar
   - `app/[locale]/collections/[category]/page.tsx` — verificar

**Verificación post-iteración:**
- [ ] `npm run type-check` sin errores — este es el check más importante
- [ ] Todas las páginas de producto cargan correctamente
- [ ] ProductGrid renderiza sin errores
- [ ] `npm run lint` ✅
- [ ] `npm run build` ✅

---

### Checkpoint Fase 1

Al finalizar las 4 iteraciones:

- [ ] 6/6 bugs T-series resueltos
- [ ] `research.md` actualizado: T-01..T-06 marcados como ✅ CORREGIDOS
- [ ] Inventario de páginas actualizado en `research.md`
- [ ] Build de producción limpio
- [ ] Commit final: `fix: resolve all T-series bugs (T-01..T-06)`
- [ ] Push a rama `claude/claude-code-mobile-guide-oV6Nb`

---

---

## FASE 2 — Integración de Backend Real

> Pre-requisito: Fase 1 completada ✅
> Duración estimada: 2-4 semanas (según disponibilidad)
> Meta: tienda funcional con datos reales, autenticación, y procesamiento de pagos

---

### Iteración 2.1 — Setup de Base de Datos (Supabase)

**Objetivo:** Reemplazar `lib/products.ts` mock con datos reales en PostgreSQL

**Cambios:**

1. **Crear proyecto en Supabase**
   - Obtener `DATABASE_URL` y `SUPABASE_ANON_KEY`
   - Crear `.env.local` con las variables

2. **Instalar dependencias:**
   ```bash
   npm install @supabase/supabase-js @supabase/ssr
   npm install prisma @prisma/client
   npx prisma init
   ```

3. **Schema Prisma** (`prisma/schema.prisma`):
   ```prisma
   model Product {
     id          String   @id @default(cuid())
     name        String
     slug        String   @unique
     price       Float    // en USD
     description String?
     category    String
     soldOut     Boolean  @default(false)
     isNew       Boolean  @default(false)
     createdAt   DateTime @default(now())
     images      ProductImage[]
     variants    ProductVariant[]
   }

   model ProductImage {
     id        String   @id @default(cuid())
     url       String
     alt       String
     isPrimary Boolean  @default(false)
     product   Product  @relation(fields: [productId], references: [id])
     productId String
   }

   model ProductVariant {
     id        String  @id @default(cuid())
     size      String
     color     String?
     stock     Int     @default(0)
     sku       String  @unique
     product   Product @relation(fields: [productId], references: [id])
     productId String
   }
   ```

4. **Migrar los 13 productos mock** a la DB via seed script (`prisma/seed.ts`)

5. **Actualizar `lib/products.ts`** para usar Prisma Client:
   ```typescript
   import { prisma } from '@/lib/prisma';

   export async function getProducts(category?: string): Promise<ProductData[]> {
     return prisma.product.findMany({
       where: category ? { category } : undefined,
       include: { images: true, variants: true },
       orderBy: { createdAt: 'desc' },
     });
   }
   ```

6. **Agregar ISR** en páginas que consumen productos:
   ```typescript
   export const revalidate = 3600; // revalida cada hora
   ```

**Verificación post-iteración:**
- [ ] `npx prisma db push` corre sin errores
- [ ] `npx prisma db seed` migra los 13 productos
- [ ] Home page muestra productos desde DB
- [ ] Páginas de producto cargan desde DB
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅
- [ ] `research.md` actualizado

---

### Iteración 2.2 — Autenticación de Usuarios (NextAuth.js v5)

**Objetivo:** Hacer funcionales las páginas de account (login, registro, perfil)

**Cambios:**

1. **Instalar:**
   ```bash
   npm install next-auth@beta
   ```

2. **Schema Prisma** — agregar modelos de auth:
   ```prisma
   model User {
     id            String    @id @default(cuid())
     email         String    @unique
     name          String?
     password      String?   // hashed con bcrypt
     role          String    @default("user")
     emailVerified DateTime?
     accounts      Account[]
     sessions      Session[]
     orders        Order[]
     createdAt     DateTime  @default(now())
   }
   // + Account, Session, VerificationToken (estándar NextAuth)
   ```

3. **Crear `auth.ts`** (config NextAuth v5):
   - Provider: Credentials (email/password) + Google OAuth
   - Adapter: PrismaAdapter

4. **Crear `app/api/auth/[...nextauth]/route.ts`**

5. **Proteger rutas `/account/profile`, `/account/orders`, `/account/addresses`** en middleware

6. **Actualizar páginas de account:**
   - `account/page.tsx` (login): conectar a `signIn()` de NextAuth
   - `account/register/page.tsx`: crear usuario en DB con contraseña hasheada
   - `account/profile/page.tsx`: mostrar datos reales del usuario autenticado
   - `account/forgot-password/page.tsx`: generar token + enviar email (iteración 2.4)

**Variables de entorno necesarias:**
```
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=       # opcional
GOOGLE_CLIENT_SECRET=   # opcional
```

**Verificación post-iteración:**
- [ ] Login con email/contraseña funciona
- [ ] Sesión persiste entre páginas
- [ ] Rutas protegidas redirigen a login si no autenticado
- [ ] Perfil muestra nombre y email real
- [ ] Logout funciona
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅
- [ ] `research.md` actualizado

---

### Iteración 2.3 — Procesamiento de Pagos (Stripe)

**Objetivo:** Checkout real con tarjeta de crédito/débito

**Cambios:**

1. **Instalar:**
   ```bash
   npm install stripe @stripe/stripe-js @stripe/react-stripe-js
   ```

2. **Crear `app/api/payments/create-intent/route.ts`:**
   ```typescript
   export async function POST(req: Request) {
     const { amount, currency } = await req.json();
     const paymentIntent = await stripe.paymentIntents.create({
       amount: Math.round(amount * 100), // en centavos
       currency: currency.toLowerCase(), // 'mxn' o 'usd'
     });
     return Response.json({ clientSecret: paymentIntent.client_secret });
   }
   ```

3. **Crear `app/api/payments/webhook/route.ts`:**
   - Verificar firma de Stripe
   - En evento `payment_intent.succeeded`: crear orden en DB, vaciar carrito

4. **Reemplazar form de tarjeta mock en `checkout/page.tsx`:**
   - Integrar `<PaymentElement>` de Stripe Elements
   - En submit: llamar `/api/payments/create-intent`, confirmar con Stripe SDK

5. **Schema Prisma** — agregar modelo Order:
   ```prisma
   model Order {
     id              String      @id @default(cuid())
     userId          String?
     user            User?       @relation(...)
     items           OrderItem[]
     subtotal        Float
     tax             Float
     shipping        Float
     total           Float
     status          String      @default("pending")
     stripePaymentId String?
     createdAt       DateTime    @default(now())
   }
   model OrderItem {
     id        String @id @default(cuid())
     orderId   String
     order     Order  @relation(...)
     productId String
     name      String // snapshot al momento del pedido
     price     Float
     quantity  Int
     size      String?
     color     String?
   }
   ```

6. **Actualizar página de éxito** `checkout/success/[orderId]/page.tsx`:
   - Leer orden real desde DB por orderId
   - Mostrar detalles reales del pedido

**Variables de entorno necesarias:**
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

**Verificación post-iteración:**
- [ ] Flujo de pago completo en modo test (tarjeta `4242 4242 4242 4242`)
- [ ] Orden se crea en DB tras pago exitoso
- [ ] Página de éxito muestra ID real de orden
- [ ] Webhook verifica firma correctamente
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅
- [ ] `research.md` actualizado

---

### Iteración 2.4 — Órdenes, Emails y Cierre de Fase 2

**Objetivo:** Historial de órdenes funcional + emails transaccionales

**Cambios:**

1. **Historial de órdenes:**
   - `account/orders/page.tsx`: fetch órdenes del usuario autenticado desde DB
   - `account/orders/[orderId]/page.tsx`: detalle de orden real

2. **Emails transaccionales con Resend:**
   ```bash
   npm install resend
   ```
   - `lib/email.ts`: cliente de Resend
   - Template: confirmación de orden (nombre, items, total, número de orden)
   - Enviar desde webhook de Stripe al confirmar pago

3. **Inventario en tiempo real:**
   - Al completar orden: `prisma.productVariant.update({ where: { id }, data: { stock: { decrement: qty } } })`
   - Si stock llega a 0: marcar producto como soldOut automáticamente
   - `ProductContent.tsx`: mostrar stock disponible por talla

4. **Actualizar carrito del usuario autenticado:**
   - Si el usuario está logueado, sincronizar localStorage con DB
   - Al login: mergear carrito local con carrito guardado en DB

**Variables de entorno necesarias:**
```
RESEND_API_KEY=
```

**Verificación post-iteración:**
- [ ] Historial de órdenes muestra pedidos reales
- [ ] Email de confirmación llega al completar orden
- [ ] Stock se descuenta correctamente
- [ ] Producto se marca soldOut al llegar a 0 stock
- [ ] `npm run type-check` ✅
- [ ] `npm run build` ✅
- [ ] `research.md` actualizado con estado final de Fase 2

---

### Checkpoint Fase 2

Al finalizar las 4 iteraciones:

- [ ] Productos reales desde DB (Supabase + Prisma)
- [ ] Autenticación funcional (login, registro, perfil)
- [ ] Pagos reales procesados con Stripe
- [ ] Órdenes guardadas en DB con historial
- [ ] Emails transaccionales activos
- [ ] Inventario en tiempo real
- [ ] `research.md` actualizado con estado final
- [ ] Build de producción limpio
- [ ] Deploy en Vercel configurado

---

## Resumen Visual

```
FASE 1 (1 día)                    FASE 2 (2-4 semanas)
────────────────────────────────  ──────────────────────────────────────────
It 1.1: T-01 + T-03               It 2.1: Base de datos (Supabase + Prisma)
  └ formatPrice en ProductCard       └ Schema, seed, getProducts() real
  └ Fix imagen Jeans Wrangler
                                    It 2.2: Auth (NextAuth.js v5)
It 1.2: T-04 + T-06                 └ Login, registro, sesiones, protección
  └ TAX_RATE = 0.16
  └ i18n en contador de colección    It 2.3: Pagos (Stripe)
                                     └ PaymentIntent, webhook, órdenes en DB
It 1.3: T-05
  └ CATEGORIES alineadas             It 2.4: Órdenes + Emails + Inventario
  └ Mapa bilingüe centralizado       └ Historial órdenes, Resend, stock real

It 1.4: T-02
  └ ProductData vs Product           Checkpoint ✅
  └ Tipos reconciliados

Checkpoint ✅
```

---

## Protocolo Post-Iteración (Checklist Rápido)

Después de cada iteración, ejecutar en orden:

```bash
# 1. Verificar tipos
npm run type-check

# 2. Verificar linting
npm run lint

# 3. Build de producción
npm run build

# 4. Si todo pasa → commit atómico
git add <archivos-modificados>
git commit -m "fix(iter-X.Y): descripción clara"
git push -u origin claude/claude-code-mobile-guide-oV6Nb
```

Luego:
- Actualizar `research.md` — marcar bug(s) como ✅ RESUELTO
- Actualizar tabla de inventario de páginas si aplica
- Anotar cualquier nuevo bug encontrado durante la iteración

---

*Plan creado: 2026-03-12 — sujeto a ajustes según hallazgos durante ejecución*
